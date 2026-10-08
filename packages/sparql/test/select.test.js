import { rejects, strictEqual } from 'node:assert'
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

  describe('query validation', () => {
    const endpoint = new URL('http://example.org/validation')
    const insert = `INSERT DATA {
  <http://example.com/a> <http://example.com/p> <http://example.com/b>
}`
    const accepted = {
      SELECT: 'SELECT * WHERE { ?s ?p ?o }',
      ASK: 'ASK { ?s ?p ?o }',
      'SELECT with PREFIX': 'PREFIX ex: <http://example.com/>\nSELECT * WHERE {\n  ?s ex:p ?o\n}',
      'SELECT after a comment': '# just a comment\nSELECT * WHERE { ?s ?p ?o }',
    }
    const rejected = {
      'INSERT DATA': insert,
      'DELETE WHERE': 'DELETE WHERE { ?s ?p ?o }',
      LOAD: 'LOAD <http://example.com/data>',
      'CLEAR ALL': 'CLEAR ALL',
      'DROP ALL': 'DROP ALL',
      CONSTRUCT: 'CONSTRUCT { ?s ?p ?o } WHERE { ?s ?p ?o }',
      DESCRIBE: 'DESCRIBE <http://example.com/a>',
      'UPDATE with trailing SELECT comment': `${insert}\n# SELECT`,
      'UPDATE with leading SELECT comment': `# SELECT\n${insert}`,
      'UPDATE with leading ASK comment': `# ASK\n${insert}`,
      'UPDATE with trailing ASK comment': `${insert}\n# ASK`,
      'SELECT followed by an update': 'SELECT * WHERE { ?s ?p ?o } ; DROP ALL',
      'update followed by SELECT': 'DROP ALL ; SELECT * WHERE { ?s ?p ?o }',
      'invalid SPARQL': 'SELECT * WHERE {',
      'empty string': '',
    }

    for (const [name, query] of Object.entries(accepted)) {
      it(`should accept ${name}`, async () => {
        nock(endpoint.origin)
          .get(`${endpoint.pathname}?query=${encodeURIComponent(query)}`)
          .reply(200, '{}')

        await getStream.array(await select({ endpoint, query }))
      })
    }

    for (const [name, query] of Object.entries(rejected)) {
      it(`should reject ${name}`, async () => {
        await rejects(() => select({ endpoint, query }), /only accepts SELECT or ASK/)
      })
    }

    it('should reject a non-string query', async () => {
      await rejects(() => select({ endpoint, query: undefined }), /only accepts SELECT or ASK/)
    })
  })
})
