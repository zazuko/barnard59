import { strictEqual } from 'node:assert'
import env from 'barnard59-env'
import { getParserByExtension } from '../../lib/localFetch/lookupParser.js'

describe('metadata.lfetch.lookupParser', function () {
  it('should return a parser for well-known RDF extensions', async function () {
    const rdfExtensions = [
      'jsonld',
      'trig',
      'nq',
      'nt',
      'n3',
      'ttl',
      'rdf',
    ]

    rdfExtensions.forEach((extension) => {
      const parser = getParserByExtension(env, `/file.${extension}`)
      strictEqual(parser !== null, true, `Should get a parser for extension ${extension}`)
    })
  })

  it('should return undefined for non standard RDF extensions', async function () {
    const nonRdfExtensions = [
      'xml',
      'turtle',
    ]

    nonRdfExtensions.forEach((extension) => {
      const parser = getParserByExtension(env, `/file.${extension}`)
      strictEqual(parser === undefined, true, `Should not get a parser for extension ${extension}`)
    })
  })
})
