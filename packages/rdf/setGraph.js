import TripleToQuadTransform from 'rdf-transform-triple-to-quad'

/**
 * @this {import('barnard59-core').Context}
 * @param {string | import('@rdfjs/types').Term | undefined} graph
 * @return {import('readable-stream').Transform}
 */
function setGraph(graph) {
  const iri = (graph && (typeof graph === 'string' ? graph : graph.value)) || ''

  if (iri === '') {
    return new TripleToQuadTransform(this.env.defaultGraph())
  }

  return new TripleToQuadTransform(this.env.namedNode(iri), { factory: this.env })
}

export default setGraph
