import { deepStrictEqual, strictEqual } from 'assert'
import { promisify } from 'util'
import rdf from '@rdfjs/data-model'
import namespace from '@rdfjs/namespace'
import { quadToNTriples } from '@rdfjs/to-ntriples'
import withServer from 'express-as-promise/withServer.js'
import getStream from 'get-stream'
import { isReadable, isWritable } from 'isstream'
import { describe, it } from 'mocha'
import { finished } from 'readable-stream'
import put from '../put.js'

const ns = namespace('http://example.org/')

describe('put', () => {
  it('should return a writable stream', async () => {
    await withServer(async server => {
      const baseUrl = await server.listen()

      const stream = put({ endpoint: baseUrl })

      strictEqual(isReadable(stream), false)
      strictEqual(isWritable(stream), true)

      stream.end()
    })
  })

  it('should send a PUT request', async () => {
    await withServer(async server => {
      let called = false
      const quad = rdf.quad(ns.subject1, ns.predicate1, ns.object1, ns.graph1)

      server.app.put('/', async (req, res) => {
        called = true

        res.status(204).end()
      })

      const baseUrl = await server.listen()
      const stream = put({ endpoint: baseUrl })

      stream.write(quad)
      stream.end()

      await promisify(finished)(stream)

      strictEqual(called, true)
    })
  })

  it('should do nothing if the stream was closed and no quads have been written', async () => {
    await withServer(async server => {
      let called = false

      server.app.put('/', async (req, res) => {
        called = true

        res.status(204).end()
      })

      const baseUrl = await server.listen()
      const stream = put({ endpoint: baseUrl })

      stream.end()

      await promisify(finished)(stream)

      strictEqual(called, false)
    })
  })

  it('should send a content-type header with the value application/n-triples', async () => {
    await withServer(async server => {
      let mediaType = null
      const quad = rdf.quad(ns.subject1, ns.predicate1, ns.object1, ns.graph1)

      server.app.put('/', async (req, res) => {
        mediaType = req.get('content-type')

        res.status(204).end()
      })

      const baseUrl = await server.listen()
      const stream = put({ endpoint: baseUrl })

      stream.write(quad)
      stream.end()

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
        rdf.quad(ns.subject4, ns.predicate4, ns.object4, ns.graph1)
      ]
      const expected = quads.map(quad => {
        return quadToNTriples(rdf.quad(quad.subject, quad.predicate, quad.object)) + '\n'
      }).join('')

      server.app.put('/', async (req, res) => {
        content[req.query.graph] = await getStream(req)

        res.status(204).end()
      })

      const baseUrl = await server.listen()
      const stream = put({ endpoint: baseUrl })

      quads.forEach(quad => {
        stream.write(quad)
      })

      stream.end()

      await promisify(finished)(stream)

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
        rdf.quad(ns.subject4, ns.predicate4, ns.object4)
      ]
      const expected = quads.map(quad => {
        return quadToNTriples(rdf.quad(quad.subject, quad.predicate, quad.object)) + '\n'
      }).join('')

      server.app.put('/', async (req, res) => {
        graph = req.query.graph
        content = await getStream(req)

        res.status(204).end()
      })

      const baseUrl = await server.listen()
      const stream = put({ endpoint: baseUrl })

      quads.forEach(quad => {
        stream.write(quad)
      })

      stream.end()

      await promisify(finished)(stream)

      strictEqual(typeof graph, 'undefined')
      strictEqual(content, expected)
    })
  })

  it('should use multiple requests to send multiple graphs', async () => {
    await withServer(async server => {
      const content = {}
      const quads = [
        rdf.quad(ns.subject1, ns.predicate1, ns.object1, ns.graph1),
        rdf.quad(ns.subject2, ns.predicate2, ns.object2, ns.graph1),
        rdf.quad(ns.subject3, ns.predicate3, ns.object3),
        rdf.quad(ns.subject4, ns.predicate4, ns.object4),
        rdf.quad(ns.subject5, ns.predicate5, ns.object5, ns.graph2),
        rdf.quad(ns.subject6, ns.predicate6, ns.object6, ns.graph2)
      ]
      const expected = quads.reduce((expected, quad) => {
        const graphIri = quad.graph.value || 'default'

        expected[graphIri] = (expected[graphIri] || '') +
          quadToNTriples(rdf.quad(quad.subject, quad.predicate, quad.object)) + '\n'

        return expected
      }, {})

      server.app.put('/', async (req, res) => {
        content[typeof req.query.graph === 'string' ? req.query.graph : 'default'] = await getStream(req)

        res.status(204).end()
      })

      const baseUrl = await server.listen()
      const stream = put({ endpoint: baseUrl })

      quads.forEach(quad => {
        stream.write(quad)
      })

      stream.end()

      await promisify(finished)(stream)

      Object.entries(expected).forEach(([graphIri, graphContent]) => {
        strictEqual(graphContent, content[graphIri])
      })
    })
  })

  it('should use PUT and POST methods to combine multiple requests split by maxQuadsPerRequest', async () => {
    await withServer(async server => {
      const contentPut = []
      const contentPost = []
      const quads = [
        rdf.quad(ns.subject1, ns.predicate1, ns.object1),
        rdf.quad(ns.subject2, ns.predicate2, ns.object2),
        rdf.quad(ns.subject3, ns.predicate3, ns.object3),
        rdf.quad(ns.subject4, ns.predicate4, ns.object4)
      ]
      const expectedPut = [quadToNTriples(quads[0]) + '\n' + quadToNTriples(quads[1]) + '\n']
      const expectedPost = [quadToNTriples(quads[2]) + '\n' + quadToNTriples(quads[3]) + '\n']

      server.app.post('/', async (req, res) => {
        contentPost.push(await getStream(req))

        res.status(204).end()
      })

      server.app.put('/', async (req, res) => {
        contentPut.push(await getStream(req))

        res.status(204).end()
      })

      const baseUrl = await server.listen()
      const stream = put({ endpoint: baseUrl, maxQuadsPerRequest: 2 })

      quads.forEach(quad => {
        stream.write(quad)
      })

      stream.end()

      await promisify(finished)(stream)

      deepStrictEqual(contentPut, expectedPut)
      deepStrictEqual(contentPost, expectedPost)
    })
  })

  it('should send a basic authentication header if user and password are given', async () => {
    await withServer(async server => {
      let credentials = null
      const quad = rdf.quad(ns.subject1, ns.predicate1, ns.object1, ns.graph1)

      server.app.put('/', async (req, res) => {
        credentials = req.get('authorization')

        res.status(204).end()
      })

      const baseUrl = await server.listen()
      const stream = put({ endpoint: baseUrl, user: 'testuser', password: 'testpassword' })

      stream.write(quad)
      stream.end()

      await promisify(finished)(stream)

      strictEqual(credentials, 'Basic dGVzdHVzZXI6dGVzdHBhc3N3b3Jk')
    })
  })

  it('should handle server errors', async () => {
    await withServer(async server => {
      const quad = rdf.quad(ns.subject1, ns.predicate1, ns.object1, ns.graph1)

      server.app.put('/', async (req, res) => {
        res.status(500).end()
      })

      const baseUrl = await server.listen()
      const stream = put({ endpoint: baseUrl })

      stream.write(quad)
      stream.end()

      let error = null

      try {
        await promisify(finished)(stream)
      } catch (err) {
        error = err
      }

      strictEqual(error && error.message.includes('Internal Server Error'), true)
    })
  })
})
