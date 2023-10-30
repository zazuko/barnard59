import createPipeline from '../factory/pipeline.js'

async function loader(ptr, { basePath, context = {}, loaderRegistry, variables } = {}) {
  if (ptr.has(context.env.ns.rdf.type, context.env.ns.p.Pipeline).terms.length > 0) {
    return createPipeline(ptr, { basePath, context, loaderRegistry, logger: context.logger, variables }).stream
  }

  throw new Error('Unrecognized or missing pipeline type')
}

loader.register = (registry, env) => {
  registry.registerNodeLoader(env.ns.p.Pipeline, loader)
}

export default loader
