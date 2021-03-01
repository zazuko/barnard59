import { namedNode } from 'rdf-ext'
import TripleToQuadTransform from 'rdf-transform-triple-to-quad'

export default function setGraph (graph) {
  return new TripleToQuadTransform(namedNode(graph.toString()))
}
