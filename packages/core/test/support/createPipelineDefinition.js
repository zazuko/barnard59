import clownface from 'clownface'
import rdf from 'rdf-ext'
import ns from './namespaces.js'

function createPipelineDefinition ({
  dataset,
  term,
  readable,
  readableObjectMode,
  writable,
  writableObjectMode
} = {}) {
  const ptr = clownface({
    dataset: dataset || rdf.dataset(),
    term: term || rdf.blankNode()
  })

  ptr.addOut(ns.rdf.type, ns.p.Pipeline)

  if (readable) {
    ptr.addOut(ns.rdf.type, ns.p.Readable)
  }

  if (readableObjectMode) {
    ptr.addOut(ns.rdf.type, ns.p.ReadableObjectMode)
  }

  if (writable) {
    ptr.addOut(ns.rdf.type, ns.p.Writable)
  }

  if (writableObjectMode) {
    ptr.addOut(ns.rdf.type, ns.p.WritableObjectMode)
  }

  return ptr
}

export default createPipelineDefinition
