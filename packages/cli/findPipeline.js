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
    const alternatives = ptr.values.map(x => `\n\t--pipeline ${x}`).join('')
    const error = new Error(`Multiple root pipelines found. Try one of these:${alternatives}`)
    error.skipTrace = true
    throw error
  }

  return ptr
}

export default findPipeline
