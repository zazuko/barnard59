import { strictEqual } from 'assert'
import { describe, it } from 'mocha'
import { getParserByExtension } from '../../lib/localFetch/lookupParser.js'

describe('metadata.lfetch.lookupParser', () => {
  it('should be a function', () => {
    strictEqual(typeof getParserByExtension, 'function')
  })

  it('should return a parser for well-known RDF extensions', async () => {
    const rdfExtensions = [
      'jsonld',
      'trig',
      'nq',
      'nt',
      'n3',
      'ttl',
      'rdf'
    ]

    rdfExtensions.forEach(extension => {
      const parser = getParserByExtension(`/file.${extension}`)
      strictEqual(parser !== null, true, `Should get a parser for extension ${extension}`)
    })
  })

  it('should return undefined for non standard RDF extensions', async () => {
    const nonRdfExtensions = [
      'xml',
      'turtle'
    ]

    nonRdfExtensions.forEach(extension => {
      const parser = getParserByExtension(`/file.${extension}`)
      strictEqual(parser === undefined, true, `Should not get a parser for extension ${extension}`)
    })
  })
})
