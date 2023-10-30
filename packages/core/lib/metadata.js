function metadata(rdf, ptr) {
  const readableObjectMode = Boolean(ptr.has(rdf.ns.rdf.type, rdf.ns.p.ReadableObjectMode).term)
  const readable = Boolean(ptr.has(rdf.ns.rdf.type, rdf.ns.p.Readable).term) || readableObjectMode
  const writableObjectMode = Boolean(ptr.has(rdf.ns.rdf.type, rdf.ns.p.WritableObjectMode).term)
  const writable = Boolean(ptr.has(rdf.ns.rdf.type, rdf.ns.p.Writable).term) || writableObjectMode

  return {
    readable,
    readableObjectMode,
    writable,
    writableObjectMode,
  }
}

export default metadata
