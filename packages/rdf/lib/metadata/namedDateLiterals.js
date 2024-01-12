import rdf from 'barnard59-env'

const namedDateLiterals = new Map()

namedDateLiterals.set('TIME_NOW', metadata => {
  return rdf.literal((new Date()).toISOString(), rdf.ns.xsd.dateTime)
})

namedDateLiterals.set('TIME_FILE_CREATION', metadata => {
  if (!metadata?.stats?.birthtimeMs) {
    throw new Error('No metadata.stats.birthtimeMs')
  }
  return rdf.literal((new Date(metadata.stats.birthtimeMs)).toISOString(), rdf.ns.xsd.dateTime)
})

namedDateLiterals.set('TIME_FILE_MODIFICATION', metadata => {
  if (!metadata?.stats?.mtimeMs) {
    throw new Error('No metadata.stats.mtimeMs')
  }
  return rdf.literal((new Date(metadata.stats.mtimeMs)).toISOString(), rdf.ns.xsd.dateTime)
})

export { namedDateLiterals }
