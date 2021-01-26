const cf = require('clownface')
const fromFile = require('rdf-utils-fs/fromFile')
const fs = require('fs')
const namespace = require('@rdfjs/namespace')
const rdf = require('rdf-ext')
const readline = require('readline')
const iriResolve = require('rdf-loader-code/lib/iriResolve')
const utils = require('./utils')
const Issue = require('./issue')
const checks = require('./schema')

const ns = {
  schema: namespace('http://schema.org/'),
  rdf: namespace('http://www.w3.org/1999/02/22-rdf-syntax-ns#'),
  p: namespace('https://pipeline.described.at/'),
  code: namespace('https://code.described.at/')
}
const acceptedPipelineProperties = ['Readable', 'ReadableObjectMode', 'Writable', 'WritableObjectMode']

async function readGraph (file, errors = []) {
  const quadStream = fromFile(file)
  const parserPromise = new Promise((resolve, reject) => {
    quadStream.on('error', reject)
    quadStream.on('end', resolve)
  })
  const datasetPromise = rdf.dataset().import(quadStream)

  let issue, dataset, _err
  try {
    [_err, dataset] = await Promise.all([parserPromise, datasetPromise])
    issue = Issue.info({
      message: checks.parser.messageSuccess(file)
    })
  }
  catch (err) {
    const error = await parseError(file, err)
    issue = Issue.error({
      message: checks.parser.messageFailure(file, error)
    })
  }
  errors.push(issue)
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

function getPipelineProperties (graph, pipelines) {
  const pipeline2properties = {}

  for (const id of pipelines) {
    pipeline2properties[id] = []

    graph
      .namedNode(id)
      .out(ns.rdf.type)
      .forEach(node => {
        const nodeComponents = node.term.value.split('/')
        const property = nodeComponents[nodeComponents.length - 1]

        pipeline2properties[id].push(property)
      })
  }

  for (const key in pipeline2properties) {
    if (pipeline2properties[key].length === 0) {
      pipeline2properties[key] = null
    }
  }
  return pipeline2properties
}

async function getAllOperationProperties (dependencies, errors = []) {
  const results = {}
  for (const env in dependencies) {
    for (const module in dependencies[env]) {
      let operationsPath
      try {
        const modulePath = utils.removeFilePart(require.resolve(module))
        operationsPath = `${modulePath}/operations.ttl`

        const issue = Issue.info({ message: checks.dependencies.messageSuccess(module) })
        errors.push(issue)
      }
      catch (err) {
        const codelinksWithMissingMetadata = Array.from(dependencies[env][module]).join('"\n  * "')
        const issue = Issue.error({
          message: checks.dependencies.messageFailure(module, codelinksWithMissingMetadata)
        })
        errors.push(issue)
        continue
      }

      let issue
      if (fs.existsSync(operationsPath)) {
        const graph = await readGraph(operationsPath, errors)
        const tempResults = getModuleOperationProperties(graph, dependencies[env][module].values())
        Object.assign(results, tempResults)

        issue = Issue.info({ message: checks.operations.messageSuccess(module) })
      }
      else {
        const codelinksWithMissingMetadata = Array.from(dependencies[env][module]).join('"\n  * "')
        issue = Issue.warning({
          message: checks.operations.messageFailure(module, codelinksWithMissingMetadata)
        })

        for (const codelink of dependencies[env][module]) {
          results[codelink] = null
        }
      }
      errors.push(issue)
    }
  }
  return results
}

function validatePipelines (pipelines, operation2properties, pipeline2properties, errors) {
  Object.entries(pipelines).forEach(([pipeline, steps]) => {
    const firstOpProperties = operation2properties[steps[0].stepOperation]
    const lastOpProperties = operation2properties[steps[steps.length - 1].stepOperation]
    const pipelineProperties = pipeline2properties[pipeline]

    if (firstOpProperties !== null) {
      utils.validatePipelineProperty(pipeline, pipelineProperties, firstOpProperties, 'first', errors)
    }
    if (lastOpProperties !== null) {
      utils.validatePipelineProperty(pipeline, pipelineProperties, lastOpProperties, 'last', errors)
    }

    let issue
    const hasDefinedMode = (pipelineProperties.some(p => acceptedPipelineProperties.includes(p)))
    if (!hasDefinedMode) {
      issue = Issue.warning({
        message: checks.pipelinePropertiesExist.messageFailure(pipeline)
      })
    }
    else {
      issue = Issue.info({
        message: checks.pipelinePropertiesExist.messageSuccess(pipeline)
      })
    }
    errors.push([pipeline, issue])
  })
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
        const message = checks.operationPropertiesExist.messageFailure(operation)
        const issue = Issue.warning({ message, step, operation })
        pipelineErrors.push(issue)
        return operation
      }
      else {
        const message = checks.operationPropertiesExist.messageSuccess(operation)
        const issue = Issue.info({ message, step, operation })
        pipelineErrors.push(issue)
      }

      if (!isOperation) {
        const message = checks.operationHasOperationProperty.messageFailure(operation)
        pipelineErrors.push(Issue.error({ message, step, operation }))
        return operation
      }
      else {
        const message = checks.operationHasOperationProperty.messageSuccess(operation)
        pipelineErrors.push(Issue.info({ message, step, operation }))
      }

      // first operation must be either Readable or ReadableObjectMode, except when only one step
      if (isFirstStep && !isOnlyStep) {
        if (!isReadableOrReadableObjectMode) {
          const message = checks.firstOperationIsReadable.messageFailure(operation)
          pipelineErrors.push(Issue.error({ message, step, operation }))
          return operation
        }
        else {
          const message = checks.firstOperationIsReadable.messageFailure(operation)
          pipelineErrors.push(Issue.info({ message, step, operation }))
        }
      }

      if (lastOp) {
        if (lastOperationProperties === null) {
          const message = checks.previousOperationHasMetadata.messageFailure(operation)
          pipelineErrors.push(Issue.warning({ message, step, operation }))
        }
        else {
          const message = checks.previousOperationHasMetadata.messageSuccess(operation)
          pipelineErrors.push(Issue.info({ message, step, operation }))

          // a writable operation must always be preceded by a readable operation
          if (isWritable) {
            let issue
            if (!lastIsReadable) {
              const message = checks.readableBeforeWritable.messageFailure(operation)
              issue = Issue.error({ message, step, operation })
            }
            else {
              const message = checks.readableBeforeWritable.messageSuccess(operation)
              issue = Issue.info({ message, step, operation })
            }
            pipelineErrors.push(issue)
          }
          if (isWritableObjectMode) {
            let issue
            if (!lastIsReadableObjectMode) {
              const message = checks.readableObjectModeBeforeWritableObjectMode.messageFailure(operation)
              issue = Issue.error({ message, step, operation })
            }
            else {
              const message = checks.readableObjectModeBeforeWritableObjectMode.messageSuccess(operation)
              issue = Issue.info({ message, step, operation })
            }
            pipelineErrors.push(issue)
          }

          // a readable operation must always be followed by a writable operation
          if (lastIsReadable) {
            let issue
            if (!isWritable) {
              const message = checks.writableAfterReadable.messageFailure(operation)
              issue = Issue.error({ message, step, operation })
            }
            else {
              const message = checks.writableAfterReadable.messageSuccess(operation)
              issue = Issue.info({ message, step, operation })
            }
            pipelineErrors.push(issue)
          }
          if (lastIsReadableObjectMode) {
            let issue
            if (!isWritableObjectMode) {
              const message = checks.writableObjectModeAfterReadableObjectMode.messageFailure(operation)
              issue = Issue.error({ message, step, operation })
            }
            else {
              const message = checks.writableObjectModeAfterReadableObjectMode.messageSuccess(operation)
              issue = Issue.info({ message, step, operation })
            }
            pipelineErrors.push(issue)
          }
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
  getPipelineProperties,
  validateSteps,
  validatePipelines
}
