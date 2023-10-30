import defaultLoaderRegistry from '../defaultLoaderRegistry.js'
import defaultLogger from '../defaultLogger.js'
import metadata from '../metadata.js'
import Pipeline from '../Pipeline.js'
import { VariableMap } from '../VariableMap.js'
import createStep from './step.js'
import createVariables from './variables.js'

async function createPipelineContext(ptr, { basePath, context, logger, variables }) {
  return { ...context, basePath, logger, variables }
}

async function createPipelineVariables(ptr, { basePath, context, loaderRegistry, logger, variables }) {
  let localVariables = []

  if (ptr) {
    localVariables = await createVariables(ptr.out(context.env.ns.p.variables), { basePath, context, loaderRegistry, logger, variables })
  }

  return VariableMap.merge(localVariables, variables)
}

function createPipeline(ptr, {
  basePath,
  env,
  context = { env },
  loaderRegistry = defaultLoaderRegistry(context.env),
  logger = defaultLogger(),
  variables = new VariableMap(),
} = {}) {
  if (!ptr.term || !ptr.dataset) {
    throw new Error('the given graph pointer is invalid')
  }

  ptr = context.env.clownface({ dataset: ptr.dataset, term: ptr.term })

  const onInit = async pipeline => {
    variables = await createPipelineVariables(ptr, { basePath, context, loaderRegistry, logger, variables })
    context = await createPipelineContext(ptr, { basePath, context, logger, variables })

    logVariables(ptr, context, variables)

    // add pipeline factory with current values as defaults
    const defaults = { basePath, context, loaderRegistry, logger, variables }
    context.createPipeline = (ptr, args) => createPipeline(ptr, { ...defaults, ...args })

    pipeline.variables = variables
    pipeline.context = context

    for (const stepPtr of ptr.out(context.env.ns.p.steps).out(context.env.ns.p.stepList).list()) {
      if (stepPtr.has(context.env.ns.rdf.type, context.env.ns.p.Pipeline).terms.length > 0) {
        pipeline.addChild(createPipeline(stepPtr, { basePath, context, loaderRegistry, logger, variables }))
      } else {
        pipeline.addChild(await createStep(stepPtr, { basePath, context, loaderRegistry, logger, variables }))
      }
    }
  }

  return new Pipeline({ basePath, loaderRegistry, logger, onInit, ptr, ...metadata(context.env, ptr) })
}

function logVariables(ptr, { env, logger }, variables) {
  if (variables.size) {
    for (const [key, value] of variables) {
      let level = 'verbose'
      if (ptr.out(env.ns.p.variables).out(env.ns.p.variable).has(env.ns.p.name, key).term) {
        level = 'info'
      }

      const isSensitive = !!ptr.any()
        .has(env.ns.rdf.type, env.ns.p.Variable)
        .has(env.ns.p.name, key)
        .has(env.ns.p.sensitive, true)
        .term

      logger[level](`variable ${key}: ${isSensitive ? '***' : value}`, { iri: ptr.value })
    }
  }
}

export default createPipeline
