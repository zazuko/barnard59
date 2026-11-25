import fs from 'node:fs'
import readline from 'node:readline'
import rdf from 'barnard59-env'
import { desugar, fileToDataset } from 'barnard59/lib/pipeline.js'
import iriResolve from 'rdf-loader-code/lib/iriResolve.js'
import Issue from './issue.js'
import * as utils from './utils.js'
import validatePipelineProperty from './validatePipelineProperty.js'
import * as validators from './validators/index.js'

const ns = {
  p: rdf.namespace('https://pipeline.described.at/'),
  code: rdf.namespace('https://code.described.at/'),
}

export async function readGraph(file, checks, { pipeline = false } = {}) {
  try {
    const dataset = pipeline
      ? await desugar(await fileToDataset(file), { pipelinePath: file })
      : await rdf.dataset().import(rdf.fromFile(file))
    checks.addGenericCheck(Issue.info({
      message: `File ${file} parsed successfully`,
    }))
    return rdf.clownface({ dataset })
  }
  catch (err) {
    if (err.context?.line) {
      const error = await parseError(file, err)
      checks.addGenericCheck(Issue.error({
        message: `Cannot parse ${file}:\n  ${error.message} Line ${error.context.line}:\n  ${error.context.lineContent}`,
      }))
    }
    else {
      checks.addGenericCheck(Issue.error({ message: err.message }))
    }
  }
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
    return new Promise(resolve => rl.on('close', () => resolve(error)))
  }
}

export function getIdentifiers(graph, checks, pipeline2find = null) {
  const pipeline2identifier = {}
  const pipelines = []
  const visited = new Set()

  graph
    .has(rdf.ns.rdf.type, ns.p.Pipeline)
    .forEach((pipeline) => {
      if (pipeline2find === null || pipeline2find === pipeline.term.value) {
        pipelines.push(pipeline)
      }
    })

  for (const pipeline of pipelines) {
    const id = pipeline.term.value
    if (visited.has(id)) {
      continue
    }
    visited.add(id)

    const identifiers = []
    pipeline2identifier[id] = identifiers
    const steps = pipeline.out(ns.p.steps).out(ns.p.stepList).list()

    for (const step of steps ?? []) {
      if (step.has(rdf.ns.rdf.type, ns.p.Pipeline)?.term && step.out(ns.p.steps).out(ns.p.stepList).out(rdf.ns.rdf.first).term) {
        if (pipeline2find !== null) {
          pipelines.push(step)
        }
        identifiers.push({
          stepName: step.term.value,
          stepOperation: step.term.value,
          stepProperties: ['Operation', ...getTypes(step)],
        })
        continue
      }

      const implementedBy = step.out(ns.code.implementedBy)
      const identifier = implementedBy.out(ns.code.link).term
      const currStepName = step.term.value
      const ib = implementedBy.term

      if (ib?.termType === 'Literal' && ib.datatype.equals(ns.code.EcmaScript)) {
        identifiers.push({ stepName: currStepName, stepOperation: currStepName, stepProperties: null })
        continue
      }

      const issue = validators.codelink.validate(ib, identifier, currStepName)
      checks.addPipelineCheck(issue, pipeline)

      if (ib && identifier) {
        identifiers.push({
          stepName: currStepName,
          stepOperation: identifier.value,
        })
      }
    }
  }

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
      .forEach((node) => {
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
    pipelines[key].filter(step => step.stepProperties === undefined).forEach(step => codelinks.add(step))
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
    const types = getTypes(graph.namedNode(id))
    const blankNode = !types.length && graph.blankNode?.(id)
    pipeline2properties[id] = blankNode ? getTypes(blankNode) : types
  }

  for (const key in pipeline2properties) {
    if (pipeline2properties[key].length === 0) {
      pipeline2properties[key] = null
    }
  }
  return pipeline2properties
}

function getTypes(node) {
  const types = []
  node.out(rdf.ns.rdf.type).forEach(type => types.push(type.term.value.split('/').at(-1)))
  return types
}

function getStepProperties(step, properties) {
  if (!step) {
    return null
  }
  return 'stepProperties' in step ? step.stepProperties : properties[step.stepOperation] ?? null
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
        if (!manifestGraph) continue
        const tempResults = getModuleOperationProperties(manifestGraph, dependencies[protocol][library].values())
        Object.assign(results, tempResults)
      }
      else {
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
    const firstOpProperties = getStepProperties(steps[0], operation2properties)
    const lastOpProperties = getStepProperties(steps.at(-1), operation2properties)
    const pipelineProperties = pipeline2properties[pipeline] ?? []

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
    steps.forEach((current, idx) => {
      const { stepName: step, stepOperation: operation } = current
      const previous = steps[idx - 1]
      const lastOperationProperties = getStepProperties(previous, properties)
      const operationProperties = getStepProperties(current, properties)
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
        return
      }

      issue = validators.operationHasOperationProperty.validate(isOperation, step, operation)
      checks.addPipelineCheck(issue, pipeline)
      if (!isOperation) {
        return
      }

      // first operation must be either Readable or ReadableObjectMode, except when only one step
      if (isFirstStep && !isOnlyStep) {
        issue = validators.firstOperationIsReadable.validate(isReadableOrReadableObjectMode, step, operation)
        checks.addPipelineCheck(issue, pipeline)

        if (!isReadableOrReadableObjectMode) {
          return
        }
      }

      if (previous) {
        issue = validators.previousOperationHasMetadata.validate(lastOperationProperties, step, operation)
        checks.addPipelineCheck(issue, pipeline)

        if (lastOperationProperties === null) {
          return
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
    })
  })
}
