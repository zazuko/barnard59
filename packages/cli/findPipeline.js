import rdf from 'barnard59-env'

export class MultipleRootsError extends Error {
  constructor(alternatives) {
    super('Multiple root pipelines found')
    this.name = 'MultipleRootsError'
    this.alternatives = alternatives
  }
}

function findPipeline(dataset, iri) {
  let ptr = rdf.clownface({ dataset })

  if (iri) {
    ptr = ptr.namedNode(iri)
  }

  ptr = ptr.has(rdf.ns.rdf.type, rdf.ns.p.Pipeline)

  if (ptr.terms.length === 0) {
    throw new Error('no pipeline found in the dataset')
  }

  if (ptr.terms.length > 1) {
    ptr = ptr.filter(ptr => ptr.in().terms.length === 0)
  }

  if (ptr.terms.length > 1) {
    throw new MultipleRootsError(ptr.values)
  }

  return ptr
}

export default findPipeline
