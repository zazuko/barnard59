const rdf = require('rdf-ext')
const TripleToQuadTransform = require('rdf-transform-triple-to-quad')

module.exports = (graph) => {
  return new TripleToQuadTransform(rdf.namedNode(graph.toString()))
}
