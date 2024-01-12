import rdf from 'barnard59-env'

/**
 * @typedef {{
 *   type?: string;
 *   stats?: {
 *     birthtimeMs?: number;
 *     mtimeMs?: number;
 *   }
 * }} Metadata
 */

/**
 * @typedef {'TIME_NOW' | 'TIME_FILE_CREATION' | 'TIME_FILE_MODIFICATION'} NamedDateLiteral
 */

/**
 * @type {Map<NamedDateLiteral, (metadata?: Metadata) => import('@rdfjs/types').Literal>}
 */
const namedDateLiterals = new Map()

namedDateLiterals.set('TIME_NOW', () => {
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
