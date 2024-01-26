import { strictEqual } from 'assert'
import getStream from 'get-stream'
import { isReadableStream, isWritableStream } from 'is-stream'
import nock from 'nock'
import rdf from '@zazuko/env'
import { turtle } from '@tpluscode/rdf-string'
import construct from '../construct.js'
import * as ns from './support/namespaces.js'

describe('construct', () => {
  it('should be a function', () => {
    strictEqual(typeof construct, 'function')
  })

  it('should return a readable stream', async () => {
    const endpoint = new URL('http://example.org/send-request')
    const query = 'CONSTRUCT { ?s ?p ?o } WHERE { ?s ?p ?o }'

    nock(endpoint.origin)
      .get(`${endpoint.pathname}?query=${encodeURIComponent(query)}`)
      .reply(200, '{}')

    const result = await construct({ endpoint, query })

    strictEqual(isReadableStream(result), true)
    strictEqual(isWritableStream(result), false)
  })

  it('should send a GET request', async () => {
    let called = false
    const endpoint = new URL('http://example.org/send-request')
    const query = 'CONSTRUCT { ?s ?p ?o } WHERE { ?s ?p ?o }'

    nock(endpoint.origin)
      .get(`${endpoint.pathname}?query=${encodeURIComponent(query)}`)
      .reply(200, () => {
        called = true

        return '{}'
      })

    await getStream.array(await construct({ endpoint, query }))

    strictEqual(called, true)
  })

  it('should send a POST request', async () => {
    let called = false
    const endpoint = new URL('http://example.org/send-request')
    const query = 'CONSTRUCT { ?s ?p ?o } WHERE { ?s ?p ?o }'

    nock(endpoint.origin)
      .post(endpoint.pathname, query)
      .reply(200, () => {
        called = true

        return '{}'
      })

    await getStream.array(await construct({ endpoint, query, operation: 'postDirect' }))

    strictEqual(called, true)
  })

  it('should parse the response', async () => {
    const quads = [
      rdf.quad(ns.ex(''), ns.ex.p, rdf.literal('0')),
      rdf.quad(ns.ex(''), ns.ex.p, rdf.literal('0')),
    ]
    const endpoint = new URL('http://example.org/parse-response')
    const query = 'CONSTRUCT { ?s ?p ?o } WHERE { ?s ?p ?o }'
    const content = turtle`${quads}`.toString()

    nock(endpoint.origin)
      .get(`${endpoint.pathname}?query=${encodeURIComponent(query)}`)
      .reply(200, content)

    const result = await getStream.array(await construct({ endpoint, query }))

    strictEqual(result.length, 2)
    strictEqual(quads[0].equals(result[0]), true)
    strictEqual(quads[0].equals(result[1]), true)
  })

  it('should support authentication headers', async () => {
    let credentials = null
    const endpoint = new URL('http://example.org/authentication')
    const user = 'testuser'
    const password = 'testpassword'
    const query = 'CONSTRUCT { ?s ?p ?o } WHERE { ?s ?p ?o }'

    nock(endpoint.origin)
      .get(`${endpoint.pathname}?query=${encodeURIComponent(query)}`)
      .reply(200, function () {
        credentials = this.req.headers.authorization

        return '{}'
      })

    await getStream.array(await construct({ endpoint, user, password, query }))

    strictEqual(credentials[0], 'Basic dGVzdHVzZXI6dGVzdHBhc3N3b3Jk')
  })
})
