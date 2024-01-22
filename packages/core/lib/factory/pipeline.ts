import type { DatasetCore, Term } from '@rdfjs/types'
import type { GraphPointer, MultiPointer } from 'clownface'
import { Logger } from 'winston'
import { LoaderRegistry } from 'rdf-loaders-registry'
import type { Environment } from 'barnard59-env'
import defaultLoaderRegistry from '../defaultLoaderRegistry.js'
import defaultLogger from '../defaultLogger.js'
import metadata from '../metadata.js'
import Pipeline from '../Pipeline.js'
import { VariableMap as VariableMapImpl } from '../VariableMap.js'
import { Context, VariableMap } from '../../index.js'
import createStep from './step.js'
import createVariables from './variables.js'

function createPipelineContext(
  { basePath, context, logger, variables, error }: {
    basePath: string
    context: Pick<Context, 'env'>
    logger: Logger
    variables: VariableMap
    error: (err: Error) => void
  }) {
  return { error, ...context, basePath, logger, variables } as unknown as Context
}

async function createPipelineVariables(
  ptr: GraphPointer,
  { basePath, context, loaderRegistry, logger, variables } :{
    basePath: string
    context: Pick<Context, 'env'>
    loaderRegistry: LoaderRegistry
    logger: Logger
    variables: VariableMap
  }) {
  let localVariables: VariableMap | never[] = []

  if (ptr) {
    localVariables = await createVariables(ptr.out(context.env.ns.p.variables), { basePath, context, loaderRegistry, logger })
  }

  return VariableMapImpl.merge(localVariables, variables)
}

type CreatePipeline = {
  basePath: string
  loaderRegistry?: LoaderRegistry
  logger?: Logger
  variables?: VariableMap
  env?: Environment
  context?: Context
}

function createPipeline(maybePtr: { term?: Term; dataset?: DatasetCore }, init: CreatePipeline) {
  let context: Context = init.context || { env: init.env! } as Context

  let {
    basePath,
    loaderRegistry = defaultLoaderRegistry(context.env),
    logger = defaultLogger(),
    variables = new VariableMapImpl(),
  } = init

  if (!maybePtr.term || !maybePtr.dataset) {
    throw new Error('the given graph pointer is invalid')
  }

  const ptr = context.env.clownface({ dataset: maybePtr.dataset, term: maybePtr.term })

  const onInit = async (pipeline: Pipeline) => {
    function error(err: Error) {
      logger.error(err)
      if (!pipeline.error) {
        pipeline.error = err
      }
    }

    variables = await createPipelineVariables(ptr, { basePath, context, loaderRegistry, logger, variables })
    context = await createPipelineContext({ basePath, context, logger, variables, error })

    logVariables(ptr, context, variables)

    // add pipeline factory with current values as defaults
    const defaults = { basePath, context, loaderRegistry, logger, variables }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    context.createPipeline = (ptr, { context, ...args } = {}) => createPipeline(ptr, { ...defaults, ...args })

    pipeline.variables = variables
    pipeline.context = context

    for (const stepPtr of ptr.out(context.env.ns.p.steps).out(context.env.ns.p.stepList).list()!) {
      if (stepPtr.has(context.env.ns.rdf.type, context.env.ns.p.Pipeline).terms.length > 0) {
        pipeline.addChild(createPipeline(stepPtr, { basePath, context, loaderRegistry, logger, variables }))
      } else {
        pipeline.addChild(await createStep(stepPtr, { basePath, context, loaderRegistry, logger, variables }))
      }
    }
  }

  return new Pipeline({ basePath, loaderRegistry, logger, onInit, ptr, ...metadata(context.env, ptr) })
}

function logVariables(ptr: MultiPointer, { env, logger }: Pick<Context, 'env' | 'logger'>, variables: VariableMap) {
  if (variables.size) {
    for (const [key, value] of variables) {
      let level : 'verbose' | 'info' = 'verbose'
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
