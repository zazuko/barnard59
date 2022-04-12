import { xsd } from '../namespaces.js'
import rdf from 'rdf-ext'

const namedDateLiterals = new Map()

namedDateLiterals.set('TIME_NOW', metadata => {
  return rdf.literal((new Date()).toISOString(), xsd.dateTime)
})

namedDateLiterals.set('TIME_FILE_CREATION', metadata => {
  if (!metadata?.stats?.birthtimeMs) {
    throw new Error('No metadata.stats.birthtimeMs')
  }
  return rdf.literal((new Date(metadata.stats.birthtimeMs)).toISOString(), xsd.dateTime)
})

namedDateLiterals.set('TIME_FILE_MODIFICATION', metadata => {
  if (!metadata?.stats?.mtimeMs) {
    throw new Error('No metadata.stats.mtimeMs')
  }
  return rdf.literal((new Date(metadata.stats.mtimeMs)).toISOString(), xsd.dateTime)
})

export { namedDateLiterals }