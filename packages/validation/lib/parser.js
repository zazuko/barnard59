const cf = require('clownface')
const fromFile = require('rdf-utils-fs/fromFile')
const fs = require('fs')
const namespace = require('@rdfjs/namespace')
const rdf = require('rdf-ext')
const readline = require('readline')
const iriResolve = require('rdf-loader-code/lib/iriResolve')
const utils = require('./utils')
const Issue = require('./issue')

const ns = {
  schema: namespace('http://schema.org/'),
  rdf: namespace('http://www.w3.org/1999/02/22-rdf-syntax-ns#'),
  p: namespace('https://pipeline.described.at/'),
  code: namespace('https://code.described.at/')
}

async function readGraph (file, errors = []) {
  const quadStream = fromFile(file)
  const parserPromise = new Promise((resolve, reject) => {
    quadStream.on('error', reject)
    quadStream.on('end', resolve)
  })
  const datasetPromise = rdf.dataset().import(quadStream)

  let dataset, _err
  try {
    [_err, dataset] = await Promise.all([parserPromise, datasetPromise])
  }
  catch (err) {
    const error = await parseError(file, err)
    const issue = Issue.error({
      message: `Cannot parse ${file}:\n  ${error.message} Line ${error.context.line}:\n  ${error.context.lineContent}`
    })
    errors.push(issue)
  }

  const clownfaceObj = cf({ dataset })

  return clownfaceObj
}

function parseError (path, error) {
  const { line, token: _token } = error.context
  if (typeof line === 'number') {
    const rl = readline.createInterface({
      input: fs.createReadStream(path),
      output: process.stdout,
      terminal: false
    })

    let lineNumber = 0
    rl.on('line', (lineContent) => {
      lineNumber++
      if (lineNumber === line) {
        error.context.lineContent = lineContent
        rl.close()
      }
    })
    return new Promise((resolve) => rl.on('close', () => resolve(error)))
  }
}

function getIdentifiers (graph, pipeline2find = null) {
  const pipeline2identifier = {}

  graph
    .has(ns.rdf.type, ns.p.Pipeline)
    .forEach(pipeline => {
      if (pipeline2find === null || pipeline2find === pipeline.term.value) {
        const steps = pipeline
          .out(ns.p.steps)
          .out(ns.p.stepList)
          .list()

        pipeline2identifier[pipeline.term.value] = []

        for (const step of steps) {
          const identifier = step
            .out(ns.code.implementedBy)
            .out(ns.code.link)
            .term

          pipeline2identifier[pipeline.term.value].push({
            stepName: step.term.value,
            stepOperation: identifier.value
          })
        }
      }
    })

  return pipeline2identifier
}

function getModuleOperationProperties (graph, identifiers) {
  const operation2properties = {}

  for (const id of identifiers) {
    operation2properties[id] = []

    graph
      .namedNode(id)
      .in(ns.code.link)
      .in(ns.code.implementedBy)
      .out(ns.rdf.type)
      .forEach(node => {
        const nodeComponents = node.term.value.split('/')
        const property = nodeComponents[nodeComponents.length - 1]

        operation2properties[id].push(property)
      })
  }

  for (const key in operation2properties) {
    if (operation2properties[key].length === 0) {
      operation2properties[key] = null
    }
  }

  return operation2properties
}

function getAllCodeLinks (pipelines) {
  const codelinks = new Set()
  for (const key in pipelines) {
    pipelines[key].forEach(step => codelinks.add(step))
  }
  return codelinks
}

function getDependencies (codelinks) {
  const dependencies = {}

  codelinks.forEach(({ stepOperation: codelink }) => {
    const { protocol, filename } = iriResolve(codelink, process.cwd())

    if (!dependencies[protocol]) {
      dependencies[protocol] = {}
    }
    if (!dependencies[protocol][filename]) {
      dependencies[protocol][filename] = new Set()
    }
    dependencies[protocol][filename].add(codelink)
  })

  return dependencies
}

async function getAllOperationProperties (dependencies, errors = []) {
  const results = {}
  for (const env in dependencies) {
    for (const module in dependencies[env]) {
      let operationsPath
      try {
        const modulePath = utils.removeFilePart(require.resolve(module))
        operationsPath = `${modulePath}/operations.ttl`

        const issue = Issue.info({ message: `Found package ${module}` })
        errors.push(issue)
      }
      catch (err) {
        const codelinksWithMissingMetadata = Array.from(dependencies[env][module]).join('"\n  * "')
        const issue = Issue.error({
          message: `Missing package ${module}\n  The following operations cannot be validated:\n  * "${codelinksWithMissingMetadata}"`
        })
        errors.push(issue)
        continue
      }

      if (fs.existsSync(operationsPath)) {
        const graph = await readGraph(operationsPath, errors)
        const tempResults = getModuleOperationProperties(graph, dependencies[env][module].values())
        Object.assign(results, tempResults)

        const issue = Issue.info({ message: `Found metadata file ${operationsPath}` })
        errors.push(issue)
      }
      else {
        const codelinksWithMissingMetadata = Array.from(dependencies[env][module]).join('"\n  * "')
        const issue = Issue.warning({
          message: `Missing metadata file ${operationsPath}\n  The following operations cannot be validated:\n  * "${codelinksWithMissingMetadata}"`
        })
        errors.push(issue)

        for (const codelink of dependencies[env][module]) {
          results[codelink] = null
        }
      }
    }
  }
  return results
}

function validateSteps ({ pipelines, properties }, errors) {
  Object.entries(pipelines).forEach(([pipeline, steps]) => {
    const pipelineErrors = []
    errors.push([pipeline, pipelineErrors])

    steps.reduce((lastOp, { stepName: step, stepOperation: operation }, idx) => {
      const lastOperationProperties = properties[lastOp]
      const operationProperties = properties[operation]
      const isFirstStep = idx === 0
      const isOnlyStep = steps.length === 1
      const isOperation = (operationProperties || []).includes('Operation')
      const isReadable = (operationProperties || []).includes('Readable')
      const isReadableObjectMode = (operationProperties || []).includes('ReadableObjectMode')
      const isReadableOrReadableObjectMode = isReadable || isReadableObjectMode
      const isWritable = (operationProperties || []).includes('Writable')
      const isWritableObjectMode = (operationProperties || []).includes('WritableObjectMode')
      const lastIsReadable = (lastOperationProperties || []).includes('Readable')
      const lastIsReadableObjectMode = (lastOperationProperties || []).includes('ReadableObjectMode')

      if (operationProperties === null) {
        const message = 'Cannot validate operation: no metadata'
        pipelineErrors.push(Issue.warning({ message, step, operation }))
        return operation
      }
      else {
        const message = 'Found metadata'
        pipelineErrors.push(Issue.info({ message, step, operation }))
      }

      if (!isOperation) {
        const message = `Invalid operation: it is not a ${ns.p.Operation.value}`
        pipelineErrors.push(Issue.error({ message, step, operation }))
        return operation
      }
      else {
        const message = `Found ${ns.p.Operation.value}`
        pipelineErrors.push(Issue.info({ message, step, operation }))
      }

      const issuesCount = pipelineErrors.length

      // first operation must be either Readable or ReadableObjectMode, except when only one step
      if (isFirstStep && !isOnlyStep && !isReadableOrReadableObjectMode) {
        const message = `Invalid operation: it is neither ${ns.p.Readable.value} nor ${ns.p.ReadableObjectMode.value}`
        pipelineErrors.push(Issue.error({ message, step, operation }))
        return operation
      }

      if (lastOp) {
        if (lastOperationProperties === null) {
          const message = 'Cannot validate operation: previous operation does not have metadata'
          pipelineErrors.push(Issue.warning({ message, step, operation }))
        }
        else {
          // a writable operation must always be preceded by a readable operation
          if (isWritable) {
            if (!lastIsReadable) {
              const message = 'Invalid operation: previous operation is not Readable'
              pipelineErrors.push(Issue.error({ message, step, operation }))
            }
          }
          if (isWritableObjectMode) {
            if (!lastIsReadableObjectMode) {
              const message = 'Invalid operation: previous operation is not ReadableObjectMode'
              pipelineErrors.push(Issue.error({ message, step, operation }))
            }
          }
          // a readable operation must always be followed by a writable operation
          if (lastIsReadable) {
            if (!isWritable) {
              const message = 'Invalid operation: operation is not Writable'
              pipelineErrors.push(Issue.error({ message, step, operation }))
            }
          }
          if (lastIsReadableObjectMode) {
            if (!isWritableObjectMode) {
              const message = 'Invalid operation: operation is not WritableObjectMode'
              pipelineErrors.push(Issue.error({ message, step, operation }))
            }
          }
        }
        if (issuesCount === pipelineErrors.length) {
          const message = `Valid step ${lastOperationProperties.find(op => op.startsWith('Readable'))} -> ${operationProperties.find(op => op.startsWith('Writable'))}`
          pipelineErrors.push(Issue.info({ message, step, operation }))
        }
      }

      return operation
    }, '')
  })
}

module.exports = {
  readGraph,
  getIdentifiers,
  getAllCodeLinks,
  getDependencies,
  getModuleOperationProperties,
  getAllOperationProperties,
  validateSteps
}
