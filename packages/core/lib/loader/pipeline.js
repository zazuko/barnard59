const cf = require('clownface')
const ns = require('../namespaces')
const Pipeline = require('../pipeline')

function loader (term, dataset, { context, variables, basePath, loaderRegistry }) {
  const node = cf(dataset).node(term)

  const pipelineInit = { basePath, context, variables, loaderRegistry }

  if (node.has(ns.rdf.type, ns.p.Pipeline)) {
    return new Pipeline(node, pipelineInit)
  }

  throw new Error('Unrecognized or missing pipeline type')
}

loader.register = registry => {
  registry.registerNodeLoader(ns.p('Pipeline'), loader)
  registry.registerNodeLoader(ns.p('ObjectPipeline'), loader)
}

module.exports = loader
