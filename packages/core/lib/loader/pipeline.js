const cf = require('clownface')
const createPipelineStream = require('../createPipelineStream')
const ns = require('../namespaces')

function loader (term, dataset, { context, variables, basePath, loaderRegistry }) {
  const node = cf(dataset).node(term)

  if (node.has(ns.rdf.type, ns.p.Pipeline)) {
    return createPipelineStream(node, { basePath, context, variables, loaderRegistry })
  }

  throw new Error('Unrecognized or missing pipeline type')
}

loader.register = registry => {
  registry.registerNodeLoader(ns.p('Pipeline'), loader)
}

module.exports = loader
