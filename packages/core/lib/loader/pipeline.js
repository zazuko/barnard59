const cf = require('clownface')
const ns = require('../namespaces')
const Pipeline = require('../pipeline')

module.exports = (term, dataset, context, variables, basePath) => {
  const node = cf(dataset).node(term)

  const type = node.out(ns.rdf('type'))

  const pipelineInit = { basePath, context, variables }

  if (type.term && type.term.equals(ns.p('Pipeline'))) {
    return new Pipeline(node, pipelineInit)
  }

  if (type.term && type.term.equals(ns.p('ObjectPipeline'))) {
    pipelineInit.objectMode = true
    return new Pipeline(node, pipelineInit)
  }

  throw new Error('Unrecognized or missing pipeline type')
}
