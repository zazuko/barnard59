import { strictEqual } from 'node:assert'
import getStream from 'get-stream'
import { isReadableStream, isWritableStream } from 'is-stream'
import nock from 'nock'
import rdf from 'barnard59-env'
import selectUnbound from '../select.js'

const select = selectUnbound.bind({ env: rdf })

describe('select', () => {
  it('should be a function', () => {
    strictEqual(typeof select, 'function')
  })

  it('should return a readable stream', async () => {
    const endpoint = new URL('http://example.org/send-request')
    const query = 'SELECT * WHERE { ?s ?p ?o }'

    nock(endpoint.origin)
      .get(`${endpoint.pathname}?query=${encodeURIComponent(query)}`)
      .reply(200, '{}')

    const result = await select({ endpoint, query })

    strictEqual(isReadableStream(result), true)
    strictEqual(isWritableStream(result), false)
  })

  it('should send a GET request', async () => {
    let called = false
    const endpoint = new URL('http://example.org/send-request')
    const query = 'SELECT * WHERE { ?s ?p ?o }'

    nock(endpoint.origin)
      .get(`${endpoint.pathname}?query=${encodeURIComponent(query)}`)
      .reply(200, () => {
        called = true

        return '{}'
      })

    await getStream.array(await select({ endpoint, query }))

    strictEqual(called, true)
  })

  it('should send a POST request', async () => {
    let called = false
    const endpoint = new URL('http://example.org/send-request')
    const query = 'SELECT * WHERE { ?s ?p ?o }'

    nock(endpoint.origin)
      .post(endpoint.pathname, query)
      .reply(200, () => {
        called = true

        return '{}'
      })

    await getStream.array(await select({ endpoint, query, operation: 'postDirect' }))

    strictEqual(called, true)
  })

  it('should parse the response', async () => {
    const endpoint = new URL('http://example.org/parse-response')
    const query = 'SELECT * WHERE { ?s ?p ?o }'
    const content = {
      results: {
        bindings: [{
          a: { type: 'uri', value: 'http://example.org/0' },
        }, {
          a: { type: 'uri', value: 'http://example.org/1' },
        }],
      },
    }

    nock(endpoint.origin)
      .get(`${endpoint.pathname}?query=${encodeURIComponent(query)}`)
      .reply(200, JSON.stringify(content))

    const result = await getStream.array(await select({ endpoint, query }))

    strictEqual(result[0].a.termType, 'NamedNode')
    strictEqual(result[0].a.value, content.results.bindings[0].a.value)
    strictEqual(result[1].a.termType, 'NamedNode')
    strictEqual(result[1].a.value, content.results.bindings[1].a.value)
  })

  it('should support authentication headers', async () => {
    let credentials = null
    const endpoint = new URL('http://example.org/authentication')
    const user = 'testuser'
    const password = 'testpassword'
    const query = 'SELECT * WHERE { ?s ?p ?o }'

    nock(endpoint.origin)
      .get(`${endpoint.pathname}?query=${encodeURIComponent(query)}`)
      .reply(200, function () {
        credentials = this.req.headers.authorization

        return '{}'
      })

    await getStream.array(await select({ endpoint, user, password, query }))

    strictEqual(credentials, 'Basic dGVzdHVzZXI6dGVzdHBhc3N3b3Jk')
  })
})
