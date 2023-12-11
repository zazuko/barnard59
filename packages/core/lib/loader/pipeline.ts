import { LoaderRegistry } from 'rdf-loaders-registry'
import type { Environment } from 'barnard59-env'
import type { GraphPointer } from 'clownface'
import createPipeline from '../factory/pipeline.js'
import { Context, VariableMap } from '../../index.js'

interface Options {
  basePath: string
  context: Context
  loaderRegistry: LoaderRegistry
  variables: VariableMap
}

async function loader(ptr: GraphPointer, { basePath, context, loaderRegistry, variables }: Options) {
  if (ptr.has(context.env.ns.rdf.type, context.env.ns.p.Pipeline).terms.length > 0) {
    return createPipeline(ptr, { basePath, context, loaderRegistry, logger: context.logger, variables }).stream
  }

  throw new Error('Unrecognized or missing pipeline type')
}

loader.register = (registry: LoaderRegistry, env: Environment) => {
  registry.registerNodeLoader(env.ns.p.Pipeline, loader)
}

export default loader
