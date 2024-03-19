import { strictEqual } from 'node:assert'
import { promisify } from 'node:util'
import { Readable, finished } from 'node:stream'
import rdf from '@zazuko/env'
import quadToNTriples from '@rdfjs/to-ntriples'
import withServer from 'express-as-promise/withServer.js'
import getStream from 'get-stream'
import postUnbound from '../post.js'

const post = postUnbound.bind({ env: rdf })

const ns = rdf.namespace('http://example.org/')

describe('post', () => {
  it('should send a POST request', async () => {
    await withServer(async server => {
      let called = false
      const quad = rdf.quad(ns.subject1, ns.predicate1, ns.object1, ns.graph1)

      server.app.post('/', async (req, res) => {
        called = true

        res.status(204).end()
      })

      const baseUrl = await server.listen()
      const stream = post({ endpoint: baseUrl, graph: ns.graph1 })

      await getStream(Readable.from([quad]).pipe(stream))

      strictEqual(called, true)
    })
  })

  it('should do nothing if the stream was closed and no quads have been written', async () => {
    await withServer(async server => {
      let called = false

      server.app.post('/', async (req, res) => {
        called = true

        res.status(204).end()
      })

      const baseUrl = await server.listen()
      const stream = post({ endpoint: baseUrl, graph: ns.graph1 })

      await getStream(Readable.from([]).pipe(stream))

      strictEqual(called, false)
    })
  })

  it('should send a content-type header with the value application/n-triples', async () => {
    await withServer(async server => {
      let mediaType = null
      const quad = rdf.quad(ns.subject1, ns.predicate1, ns.object1, ns.graph1)

      server.app.post('/', async (req, res) => {
        mediaType = req.get('content-type')

        res.status(204).end()
      })

      const baseUrl = await server.listen()
      const stream = post({ endpoint: baseUrl, graph: ns.graph1 })

      await getStream(Readable.from([quad]).pipe(stream))

      await promisify(finished)(stream)

      strictEqual(mediaType, 'application/n-triples')
    })
  })

  it('should send the quad stream as N-Triples', async () => {
    await withServer(async server => {
      const content = {}
      const quads = [
        rdf.quad(ns.subject1, ns.predicate1, ns.object1, ns.graph1),
        rdf.quad(ns.subject2, ns.predicate2, ns.object2, ns.graph1),
        rdf.quad(ns.subject3, ns.predicate3, ns.object3, ns.graph1),
        rdf.quad(ns.subject4, ns.predicate4, ns.object4, ns.graph1),
      ]
      const expected = quads.map(quad => {
        return quadToNTriples(rdf.quad(quad.subject, quad.predicate, quad.object)) + '\n'
      }).join('')

      server.app.post('/', async (req, res) => {
        content[req.query.graph] = await getStream(req)

        res.status(204).end()
      })

      const baseUrl = await server.listen()
      const stream = post({ endpoint: baseUrl, graph: ns.graph1 })

      await getStream(Readable.from(quads).pipe(stream))

      strictEqual(content[quads[0].graph.value], expected)
    })
  })

  it('should support default graph', async () => {
    await withServer(async server => {
      let graph = true
      let content = {}
      const quads = [
        rdf.quad(ns.subject1, ns.predicate1, ns.object1),
        rdf.quad(ns.subject2, ns.predicate2, ns.object2),
        rdf.quad(ns.subject3, ns.predicate3, ns.object3),
        rdf.quad(ns.subject4, ns.predicate4, ns.object4),
      ]
      const expected = quads.map(quad => {
        return quadToNTriples(rdf.quad(quad.subject, quad.predicate, quad.object)) + '\n'
      }).join('')

      server.app.post('/', async (req, res) => {
        graph = req.query.graph
        content = await getStream(req)

        res.status(204).end()
      })

      const baseUrl = await server.listen()
      const stream = post({ endpoint: baseUrl, graph: 'default' })

      await getStream(Readable.from(quads).pipe(stream))

      strictEqual(typeof graph, 'undefined')
      strictEqual(content, expected)
    })
  })

  it('should send a basic authentication header if user and password are given', async () => {
    await withServer(async server => {
      let credentials = null
      const quad = rdf.quad(ns.subject1, ns.predicate1, ns.object1, ns.graph1)

      server.app.post('/', async (req, res) => {
        credentials = req.get('authorization')

        res.status(204).end()
      })

      const baseUrl = await server.listen()
      const stream = post({ endpoint: baseUrl, user: 'testuser', password: 'testpassword', graph: ns.graph1 })

      await getStream(Readable.from([quad]).pipe(stream))

      await promisify(finished)(stream)

      strictEqual(credentials, 'Basic dGVzdHVzZXI6dGVzdHBhc3N3b3Jk')
    })
  })

  it('should handle server errors', async () => {
    await withServer(async server => {
      const quad = rdf.quad(ns.subject1, ns.predicate1, ns.object1, ns.graph1)

      server.app.post('/', async (req, res) => {
        res.status(500).end()
      })

      const baseUrl = await server.listen()
      const stream = post({ endpoint: baseUrl, graph: ns.graph1 })

      let error = null

      try {
        await getStream(Readable.from([quad]).pipe(stream))
      } catch (err) {
        error = err
      }

      strictEqual(error && error.message.includes('Internal Server Error'), true)
    })
  })
})
