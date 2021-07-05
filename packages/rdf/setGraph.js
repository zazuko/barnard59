import rdf from 'rdf-ext'
import TripleToQuadTransform from 'rdf-transform-triple-to-quad'

function setGraph (graph) {
  const iri = (graph && graph.value) || (graph && graph.toString()) || ''

  if (iri === '') {
    return new TripleToQuadTransform(rdf.defaultGraph())
  }

  return new TripleToQuadTransform(rdf.namedNode(iri), { factory: rdf })
}

export default setGraph
