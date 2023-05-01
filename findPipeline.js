import clownface from 'clownface'
import ns from './lib/namespaces.js'

function findPipeline(dataset, iri) {
  let ptr = clownface({ dataset })

  if (iri) {
    ptr = ptr.namedNode(iri)
  }

  ptr = ptr.has(ns.rdf.type, ns.p.Pipeline)

  if (ptr.terms.length === 0) {
    throw new Error('no pipeline found in the dataset')
  }

  if (ptr.terms.length > 1) {
    ptr = ptr.filter(ptr => ptr.in().terms.length === 0)
  }

  if (ptr.terms.length > 1) {
    throw new Error('Multiple root pipelines found.')
  }

  return ptr
}

export default findPipeline
