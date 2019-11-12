const assert = require('assert')
const getStream = require('get-stream')
const { describe, it } = require('mocha')
const nock = require('nock')
const SparqlClient = require('../lib/SparqlClient')

describe('SparqlClient', () => {
  it('should be a constructor', () => {
    assert.strictEqual(typeof SparqlClient, 'function')
  })

  describe('.select', () => {
    it('should be a method', () => {
      const client = new SparqlClient()

      assert.strictEqual(typeof client.select, 'function')
    })

    it('should send a request', async () => {
      let called = false
      const query = 'SELECT * WHERE { ?s ?p ?o }'
      const client = new SparqlClient({ endpoint: 'http://example.org/send-request' })

      nock('http://example.org')
        .get('/send-request?query=' + encodeURIComponent(query))
        .reply(200, () => {
          called = true

          return '{}'
        })

      await getStream.array(await client.select(query))

      assert(called)
    })

    it('should parse the response', async () => {
      const query = 'SELECT * WHERE { ?s ?p ?o }'
      const content = {
        results: {
          bindings: [{
            a: { type: 'uri', value: 'http://example.org/0' }
          }, {
            a: { type: 'uri', value: 'http://example.org/1' }
          }]
        }
      }
      const client = new SparqlClient({ endpoint: 'http://example.org/parse-response' })

      nock('http://example.org')
        .get('/parse-response?query=' + encodeURIComponent(query))
        .reply(200, JSON.stringify(content))

      const result = await getStream.array(await client.select(query))

      assert.strictEqual(result[0].a.termType, 'NamedNode')
      assert.strictEqual(result[0].a.value, content.results.bindings[0].a.value)
      assert.strictEqual(result[1].a.termType, 'NamedNode')
      assert.strictEqual(result[1].a.value, content.results.bindings[1].a.value)
    })

    it('should support authentication headers', async () => {
      let credentials = null
      const query = 'SELECT * WHERE { ?s ?p ?o }'
      const client = new SparqlClient({
        endpoint: 'http://example.org/authentication',
        user: 'testuser',
        password: 'testpassword'
      })

      nock('http://example.org')
        .get('/authentication?query=' + encodeURIComponent(query))
        .reply(200, function () {
          credentials = this.req.headers.authorization

          return '{}'
        })

      await getStream.array(await client.select(query))

      assert.strictEqual(credentials[0], 'Basic dGVzdHVzZXI6dGVzdHBhc3N3b3Jk')
    })
  })
})
