import ns from '../namespaces.js'
import createPipeline from '../factory/pipeline.js'

async function loader (ptr, { basePath, context, loaderRegistry, logger, variables } = {}) {
  if (ptr.has(ns.rdf.type, ns.p.Pipeline).terms.length > 0) {
    return createPipeline(ptr, { basePath, context, loaderRegistry, logger, variables }).stream
  }

  throw new Error('Unrecognized or missing pipeline type')
}

loader.register = registry => {
  registry.registerNodeLoader(ns.p.Pipeline, loader)
}

export default loader
