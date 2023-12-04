import fs from 'fs'
import readline from 'readline'
import rdf from 'barnard59-env'
import iriResolve from 'rdf-loader-code/lib/iriResolve.js'
import Issue from './issue.js'
import * as utils from './utils.js'
import validatePipelineProperty from './validatePipelineProperty.js'
import * as validators from './validators/index.js'

const ns = {
  p: rdf.namespace('https://pipeline.described.at/'),
  code: rdf.namespace('https://code.described.at/'),
}

export async function readGraph(file, checks) {
  const quadStream = rdf.fromFile(file)
  const parserPromise = new Promise((resolve, reject) => {
    quadStream.on('error', reject)
    quadStream.on('end', resolve)
  })
  const datasetPromise = rdf.dataset().import(quadStream)

  let issue, dataset
  try {
    [, dataset] = await Promise.all([parserPromise, datasetPromise])
    issue = Issue.info({
      message: `File ${file} parsed successfully`,
    })
  } catch (err) {
    if (err.stack.includes('at N3')) {
      const error = await parseError(file, err)
      issue = Issue.error({
        message: `Cannot parse ${file}:\n  ${error.message} Line ${error.context.line}:\n  ${error.context.lineContent}`,
      })
    } else {
      issue = Issue.error({
        message: err.message,
      })
    }
  }

  checks.addGenericCheck(issue)
  const clownfaceObj = rdf.clownface({ dataset })

  return clownfaceObj
}

export function parseError(path, error) {
  const { line } = error.context
  if (typeof line === 'number') {
    const rl = readline.createInterface({
      input: fs.createReadStream(path),
      output: process.stdout,
      terminal: false,
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

export function getIdentifiers(graph, checks, pipeline2find = null) {
  const pipeline2identifier = {}

  graph
    .has(rdf.ns.rdf.type, ns.p.Pipeline)
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
              stepOperation: identifier.value,
            })
          }
        }
      }
    })

  return pipeline2identifier
}

export function getModuleOperationProperties(graph, identifiers) {
  const operation2properties = {}

  for (const id of identifiers) {
    operation2properties[id] = []

    graph
      .namedNode(id)
      .in(ns.code.link)
      .in(ns.code.implementedBy)
      .out(rdf.ns.rdf.type)
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

export function getAllCodeLinks(pipelines) {
  const codelinks = new Set()
  for (const key in pipelines) {
    pipelines[key].forEach(step => codelinks.add(step))
  }
  return codelinks
}

export function getDependencies(codelinks, pipelineDir) {
  const dependencies = {}

  codelinks.forEach(({ stepOperation: codelink }) => {
    const { protocol, filename } = iriResolve(codelink, pipelineDir)

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

export function getPipelineProperties(graph, pipelines) {
  const pipeline2properties = {}

  for (const id of pipelines) {
    pipeline2properties[id] = []

    graph
      .namedNode(id)
      .out(rdf.ns.rdf.type)
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

export async function getAllOperationProperties(dependencies, checks) {
  const results = {}
  for (const protocol in dependencies) {
    for (const library in dependencies[protocol]) {
      let issue
      const operations = Array.from(dependencies[protocol][library]).join('"\n  * "')
      issue = validators.dependency.validate(library, { operations, protocol })
      checks.addGenericCheck(issue)

      if (!utils.isModuleInstalled(library)) {
        continue
      }
      const manifestPath = utils.getManifestPath(library)

      issue = validators.operation.validate(manifestPath, library, operations)
      checks.addGenericCheck(issue)

      if (manifestPath) {
        const manifestGraph = await readGraph(manifestPath, checks)
        const tempResults = getModuleOperationProperties(manifestGraph, dependencies[protocol][library].values())
        Object.assign(results, tempResults)
      } else {
        for (const codelink of dependencies[protocol][library]) {
          results[codelink] = null
        }
      }
    }
  }
  return results
}

export function validatePipelines(pipelines, operation2properties, pipeline2properties, checks) {
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

export function validateSteps({ pipelines, properties }, checks) {
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
