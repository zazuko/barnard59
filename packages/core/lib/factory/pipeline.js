import clownface from 'clownface'
import defaultLoaderRegistry from '../defaultLoaderRegistry.js'
import defaultLogger from '../defaultLogger.js'
import metadata from '../metadata.js'
import ns from '../namespaces.js'
import Pipeline from '../Pipeline.js'
import createStep from './step.js'
import createVariables from './variables.js'

async function createPipelineContext (ptr, { basePath, context, logger, variables }) {
  return { ...context, basePath, logger, variables }
}

async function createPipelineVariables (ptr, { basePath, context, loaderRegistry, logger, variables }) {
  let localVariables = []

  if (ptr) {
    localVariables = await createVariables(ptr.out(ns.p.variables), { basePath, context, loaderRegistry, logger, variables })
  }

  return new Map([...localVariables, ...variables])
}

function createPipeline (ptr, {
  basePath,
  context = {},
  loaderRegistry = defaultLoaderRegistry(),
  logger = defaultLogger(),
  variables = new Map()
} = {}) {
  if (!ptr.term || !ptr.dataset) {
    throw new Error('the given graph pointer is invalid')
  }

  ptr = clownface({ dataset: ptr.dataset, term: ptr.term })

  const onInit = async (pipeline) => {
    variables = await createPipelineVariables(ptr, { basePath, context, loaderRegistry, logger, variables })
    context = await createPipelineContext(ptr, { basePath, context, logger, variables })

    // add pipeline factory with current values as defaults
    const defaults = { basePath, context, loaderRegistry, logger, variables }
    context.createPipeline = (ptr, args) => createPipeline(ptr, { ...defaults, ...args })

    pipeline.variables = variables
    pipeline.context = context

    for (const stepPtr of ptr.out(ns.p.steps).out(ns.p.stepList).list()) {
      if (stepPtr.has(ns.rdf.type, ns.p.Pipeline).terms.length > 0) {
        pipeline.children.push(createPipeline(stepPtr, { basePath, context, loaderRegistry, logger, variables }))
      } else {
        pipeline.children.push(await createStep(stepPtr, { basePath, context, loaderRegistry, logger, variables }))
      }
    }
  }

  return new Pipeline({ basePath, loaderRegistry, logger, onInit, ptr, ...metadata(ptr) })
}

export default createPipeline
