import rdf from 'barnard59-env'
import { isGraphPointer } from 'is-graph-pointer'

export class MultipleRootsError extends Error {
  /**
   * @param {string[]} alternatives
   */
  constructor(alternatives) {
    super('Multiple root pipelines found')
    this.name = 'MultipleRootsError'
    this.alternatives = alternatives
  }
}

/**
 * @param {import('@rdfjs/types').DatasetCore} dataset
 * @param {string | import('@rdfjs/types').NamedNode} [iri]
 * @return {import('clownface').GraphPointer}
 */
function findPipeline(dataset, iri) {
  let ptr = rdf.clownface({ dataset })

  if (iri) {
    ptr = ptr.namedNode(iri)
  }

  ptr = ptr.has(rdf.ns.rdf.type, rdf.ns.p.Pipeline)

  if (ptr.terms.length === 0) {
    throw new Error('no pipeline found in the dataset')
  }

  if (!isGraphPointer(ptr)) {
    ptr = ptr.filter(ptr => ptr.in().terms.length === 0)
  }

  if (!isGraphPointer(ptr)) {
    throw new MultipleRootsError(ptr.values)
  }

  return ptr
}

export default findPipeline
