import ns from './namespaces.js'

function metadata(ptr) {
  const readableObjectMode = Boolean(ptr.has(ns.rdf.type, ns.p.ReadableObjectMode).term)
  const readable = Boolean(ptr.has(ns.rdf.type, ns.p.Readable).term) || readableObjectMode
  const writableObjectMode = Boolean(ptr.has(ns.rdf.type, ns.p.WritableObjectMode).term)
  const writable = Boolean(ptr.has(ns.rdf.type, ns.p.Writable).term) || writableObjectMode

  return {
    readable,
    readableObjectMode,
    writable,
    writableObjectMode,
  }
}

export default metadata
