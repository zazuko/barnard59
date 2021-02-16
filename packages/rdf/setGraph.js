const rdf = require('rdf-ext')
const TripleToQuadTransform = require('rdf-transform-triple-to-quad')

function setGraph (graph) {
  if (typeof graph === 'string') {
    graph = rdf.namedNode(graph)
  }

  return new TripleToQuadTransform(graph, { factory: rdf })
}

module.exports = setGraph
