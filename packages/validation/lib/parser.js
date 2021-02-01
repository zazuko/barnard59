const cf = require('clownface')
const fs = require('fs')
const namespace = require('@rdfjs/namespace')
const rdf = require('rdf-ext')
const readline = require('readline')
const fromFile = require('rdf-utils-fs/fromFile')
const iriResolve = require('rdf-loader-code/lib/iriResolve')
const Issue = require('./issue')
const utils = require('./utils')
const validatePipelineProperty = require('./validatePipelineProperty')
const validators = require('./validators')

const ns = {
  schema: namespace('http://schema.org/'),
  rdf: namespace('http://www.w3.org/1999/02/22-rdf-syntax-ns#'),
  p: namespace('https://pipeline.described.at/'),
  code: namespace('https://code.described.at/')
}

async function readGraph (file, checks) {
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
      message: `File ${file} parsed successfully`
    })
  }
  catch (err) {
    const error = await parseError(file, err)
    issue = Issue.error({
      message: `Cannot parse ${file}:\n  ${error.message} Line ${error.context.line}:\n  ${error.context.lineContent}`
    })
  }

  checks.addGenericCheck(issue)
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

function getIdentifiers (graph, checks, pipeline2find = null) {
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
          const implementedBy = step.out(ns.code.implementedBy)
          const codeLink = implementedBy.out(ns.code.link)
          const identifier = codeLink.term

          const currStepName = step.term.value
          const ib = implementedBy.term

          const issue = validators.codelink.validate(ib, identifier, currStepName)
          checks.addPipelineCheck(issue, pipeline)

          if (ib && identifier) {
            pipeline2identifier[pipeline.term.value].push({
              stepName: currStepName,
              stepOperation: identifier.value
            })
          }
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

async function getAllOperationProperties (dependencies, checks) {
  const results = {}
  for (const env in dependencies) {
    for (const module in dependencies[env]) {
      let issue
      const currOperations = Array.from(dependencies[env][module]).join('"\n  * "')
      issue = validators.dependency.validate(module, currOperations)
      checks.addGenericCheck(issue)

      if (!utils.isModuleInstalled(module)) {
        continue
      }
      const operationsPath = utils.getManifestPath(module)

      issue = validators.operation.validate(operationsPath, module, currOperations)
      checks.addGenericCheck(issue)

      if (operationsPath) {
        const graph = await readGraph(operationsPath, checks)
        const tempResults = getModuleOperationProperties(graph, dependencies[env][module].values())
        Object.assign(results, tempResults)
      }
      else {
        for (const codelink of dependencies[env][module]) {
          results[codelink] = null
        }
      }
    }
  }
  return results
}

function validatePipelines (pipelines, operation2properties, pipeline2properties, checks) {
  Object.entries(pipelines).forEach(([pipeline, steps]) => {
    const firstOpProperties = operation2properties[steps[0].stepOperation]
    const lastOpProperties = operation2properties[steps[steps.length - 1].stepOperation]
    const pipelineProperties = pipeline2properties[pipeline]

    if (firstOpProperties !== null) {
      validatePipelineProperty(pipeline, pipelineProperties, firstOpProperties, 'first', checks)
    }
    if (lastOpProperties !== null) {
      validatePipelineProperty(pipeline, pipelineProperties, lastOpProperties, 'last', checks)
    }

    const issue = validators.pipelinePropertiesExist.validate(pipeline, pipelineProperties)
    checks.addPipelineCheck(issue, pipeline)
  })
}

function validateSteps ({ pipelines, properties }, checks) {
  Object.entries(pipelines).forEach(([pipeline, steps]) => {
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
      let issue

      issue = validators.operationPropertiesExist.validate(operationProperties, step, operation)
      checks.addPipelineCheck(issue, pipeline)
      if (operationProperties === null) {
        return operation
      }

      issue = validators.operationHasOperationProperty.validate(isOperation, step, operation)
      checks.addPipelineCheck(issue, pipeline)
      if (!isOperation) {
        return operation
      }

      // first operation must be either Readable or ReadableObjectMode, except when only one step
      if (isFirstStep && !isOnlyStep) {
        issue = validators.firstOperationIsReadable.validate(isReadableOrReadableObjectMode, step, operation)
        checks.addPipelineCheck(issue, pipeline)

        if (!isReadableOrReadableObjectMode) {
          return operation
        }
      }

      if (lastOp) {
        issue = validators.previousOperationHasMetadata.validate(lastOperationProperties, step, operation)
        checks.addPipelineCheck(issue, pipeline)

        if (lastOperationProperties === null) {
          return operation
        }

        // a writable operation must always be preceded by a readable operation
        if (isWritable) {
          issue = validators.readableBeforeWritable.validate(lastIsReadable, step, operation)
          checks.addPipelineCheck(issue, pipeline)
        }
        if (isWritableObjectMode) {
          issue = validators.readableObjectModeBeforeWritableObjectMode.validate(lastIsReadableObjectMode, step, operation)
          checks.addPipelineCheck(issue, pipeline)
        }

        // a readable operation must always be followed by a writable operation
        if (lastIsReadable) {
          issue = validators.writableAfterReadable.validate(isWritable, step, operation)
          checks.addPipelineCheck(issue, pipeline)
        }
        if (lastIsReadableObjectMode) {
          issue = validators.writableObjectModeAfterReadableObjectMode.validate(isWritableObjectMode, step, operation)
          checks.addPipelineCheck(issue, pipeline)
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
  validatePipelines,
  parseError
}
