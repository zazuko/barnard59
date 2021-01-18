const cf = require('clownface')
const fromFile = require('rdf-utils-fs/fromFile')
const fs = require('fs')
const namespace = require('@rdfjs/namespace')
const path = require('path')
const rdf = require('rdf-ext')
const readline = require('readline')
const iriResolve = require('rdf-loader-code/lib/iriResolve')
const utils = require('./utils')
const Issue = require('./issue')

const removeFilePart = dirname => path.parse(dirname).dir

const ns = {
  schema: namespace('http://schema.org/'),
  rdf: namespace('http://www.w3.org/1999/02/22-rdf-syntax-ns#'),
  p: namespace('https://pipeline.described.at/'),
  code: namespace('https://code.described.at/')
}

async function readGraph(file, errors = []) {
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

function parseError(path, error) {
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

function getIdentifiers(graph) {
  const pipeline2identifier = {}

  graph
    .has(ns.rdf.type, ns.p.Pipeline)
    .forEach(pipeline => {
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
    })

  return pipeline2identifier
}

function getModuleOperationProperties(graph, identifiers) {
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

function validateDependencies(dependencies, errors = []) {
  for (const env in dependencies) {
    for (const module in dependencies[env]) {
      const modulePath = utils.removeFilePart(require.resolve(module))

      if (!(fs.existsSync(modulePath))) {
        const issue = Issue.error({
          message: `Missing package ${module}.`
        })
        errors.push(issue)
      }
    }
  }
}

function getAllCodeLinks(pipelines) {
  const codelinks = new Set()
  for (const key in pipelines) {
    pipelines[key].forEach(step => codelinks.add(step))
  }
  return codelinks
}

function getDependencies(codelinks) {
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

async function getAllOperationProperties(dependencies, errors = []) {
  const results = {}
  for (const env in dependencies) {
    for (const module in dependencies[env]) {
      const modulePath = utils.removeFilePart(require.resolve(module))
      const operationsPath = `${modulePath}/operations.ttl`

      if (fs.existsSync(operationsPath)) {
        const graph = await readGraph(operationsPath, errors)
        const tempResults = getModuleOperationProperties(graph, dependencies[env][module].values())
        Object.assign(results, tempResults)
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

function validateSteps({ pipelines, properties }, errors) {
  Object.entries(pipelines).forEach(([pipeline, steps]) => {
    const pipelineErrors = []
    errors.push([pipeline, pipelineErrors])

    steps.reduce((lastOp, { stepName: step, stepOperation: operation }, idx) => {
      const lastOpProperties = properties[lastOp]
      const operationProperties = properties[operation]
      const isFirstStep = idx === 0
      const isOnlyStep = steps.length === 1

      if (operationProperties === null) {
        const issue = Issue.warning({
          step,
          operation,
          message: 'Cannot validate operation: no metadata'
        })
        pipelineErrors.push(issue)
        return operation
      }
      if (!operationProperties.includes('Operation')) {
        const issue = Issue.error({
          step,
          operation,
          message: `Invalid operation: it is not a ${ns.p.Operation.value}`
        })
        pipelineErrors.push(issue)
      }
      // first operation must be either Readable or ReadableObjectMode, except when only one step
      else if ((isFirstStep && !isOnlyStep) && !operationProperties.includes('Readable') && !operationProperties.includes('ReadableObjectMode')) {
        const issue = Issue.error({
          step,
          operation,
          message: `Invalid operation: it is neither ${ns.p.Readable.value} nor ${ns.p.ReadableObjectMode.value}`
        })
        pipelineErrors.push(issue)
        return operation
      }

      if (lastOp) {
        if (lastOpProperties === null) {
          const issue = Issue.warning({
            step,
            operation,
            message: 'Cannot validate operation: previous operation does not have metadata'
          })
          pipelineErrors.push(issue)
        }
        else {
          // a writable operation must always be preceded by a readable operation
          if (operationProperties.includes('Writable')) {
            if (!lastOpProperties.includes('Readable')) {
              const issue = Issue.error({
                step,
                operation,
                message: 'Invalid operation: previous operation is not Readable'
              })
              pipelineErrors.push(issue)
            }
          }
          if (operationProperties.includes('WritableObjectMode')) {
            if (!lastOpProperties.includes('ReadableObjectMode')) {
              const issue = Issue.error({
                step,
                operation,
                message: 'Invalid operation: previous operation is not ReadableObjectMode'
              })
              pipelineErrors.push(issue)
            }
          }
          // a readable operation must always be followed by a writable operation
          if (lastOpProperties.includes('Readable')) {
            if (!operationProperties.includes('Writable')) {
              const issue = Issue.error({
                step,
                operation,
                message: 'Invalid operation: operation is not Writable'
              })
              pipelineErrors.push(issue)
            }
          }
          if (lastOpProperties.includes('ReadableObjectMode')) {
            if (!operationProperties.includes('WritableObjectMode')) {
              const issue = Issue.error({
                step,
                operation,
                message: 'Invalid operation: operation is not WritableObjectMode'
              })
              pipelineErrors.push(issue)
            }
          }
        }
      }
      return operation
    }, '')
  })
}

function printErrors(errors) {
  errors.forEach((error, i) => {
    if (Array.isArray(error)) {
      const [pipeline, pipelineErrors] = error
      console.error(`${i + 1}. In pipeline <${pipeline}>`)
      pipelineErrors.forEach((error, j) => {
        console.error(`${i + 1}.${j + 1}. ${error}`)
      })
    }
    else {
      console.error(`${i + 1}. ${error}`)
    }
  })
}

module.exports = {
  readGraph,
  getIdentifiers,
  getAllCodeLinks,
  getDependencies,
  getModuleOperationProperties,
  validateDependencies,
  getAllOperationProperties,
  printErrors,
  validateSteps
}
