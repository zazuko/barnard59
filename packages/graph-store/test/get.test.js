import { strictEqual } from 'assert'
import rdf from '@rdfjs/data-model'
import namespace from '@rdfjs/namespace'
import { quadToNTriples } from '@rdfjs/to-ntriples'
import withServer from 'express-as-promise/withServer.js'
import { array } from 'get-stream'
import { isReadable, isWritable } from 'isstream'
import { describe, it } from 'mocha'
import get from '../get.js'

const ns = namespace('http://example.org/')

describe('get', () => {
  it('should return a readable stream', async () => {
    await withServer(async server => {
      const baseUrl = await server.listen()

      const stream = get({ endpoint: baseUrl })

      strictEqual(isReadable(stream), true)
      strictEqual(isWritable(stream), false)

      try {
        await array(stream)
      } catch (err) {}
    })
  })

  it('should send a GET request', async () => {
    await withServer(async server => {
      let called = false

      server.app.get('/', async (req, res) => {
        called = true

        res.status(204).end()
      })

      const baseUrl = await server.listen()
      const stream = get({ endpoint: baseUrl })

      await array(stream)

      strictEqual(called, true)
    })
  })

  it('should send a accept header with the value application/n-triples', async () => {
    await withServer(async server => {
      let mediaType = null

      server.app.get('/', async (req, res) => {
        mediaType = req.get('accept')

        res.status(204).end()
      })

      const baseUrl = await server.listen()
      const stream = get({ endpoint: baseUrl })

      await array(stream)

      strictEqual(mediaType, 'application/n-triples')
    })
  })

  it('should send a graph argument', async () => {
    await withServer(async server => {
      let graph = null

      server.app.get('/', async (req, res) => {
        graph = req.query.graph

        res.status(204).end()
      })

      const baseUrl = await server.listen()
      const stream = get({ endpoint: baseUrl, graph: ns.graph1 })

      await array(stream)

      strictEqual(graph, ns.graph1.value)
    })
  })

  it('should parse the response quad stream', async () => {
    await withServer(async server => {
      const expected = [
        rdf.quad(ns.subject1, ns.predicate1, ns.object1, ns.graph1),
        rdf.quad(ns.subject2, ns.predicate2, ns.object2, ns.graph1),
        rdf.quad(ns.subject3, ns.predicate3, ns.object3, ns.graph1),
        rdf.quad(ns.subject4, ns.predicate4, ns.object4, ns.graph1)
      ]
      const content = expected.map(quad => {
        return quadToNTriples(rdf.quad(quad.subject, quad.predicate, quad.object)) + '\n'
      }).join('')

      server.app.get('/', async (req, res) => {
        res.set('content-type', 'application/n-triples').send(content)
      })

      const baseUrl = await server.listen()
      const stream = get({ endpoint: baseUrl, graph: ns.graph1 })

      const actual = await array(stream)

      expected.forEach((quad, index) => {
        strictEqual(quad.equals(actual[index]), true)
      })
    })
  })

  it('should allow string values as graph argument', async () => {
    await withServer(async server => {
      const expected = [
        rdf.quad(ns.subject1, ns.predicate1, ns.object1, ns.graph1),
        rdf.quad(ns.subject2, ns.predicate2, ns.object2, ns.graph1),
        rdf.quad(ns.subject3, ns.predicate3, ns.object3, ns.graph1),
        rdf.quad(ns.subject4, ns.predicate4, ns.object4, ns.graph1)
      ]
      const content = expected.map(quad => {
        return quadToNTriples(rdf.quad(quad.subject, quad.predicate, quad.object)) + '\n'
      }).join('')

      server.app.get('/', async (req, res) => {
        res.set('content-type', 'application/n-triples').send(content)
      })

      const baseUrl = await server.listen()
      const stream = get({ endpoint: baseUrl, graph: ns.graph1.value })

      const actual = await array(stream)

      expected.forEach((quad, index) => {
        strictEqual(quad.equals(actual[index]), true)
      })
    })
  })

  it('should support default graph as graph argument', async () => {
    await withServer(async server => {
      const expected = [
        rdf.quad(ns.subject1, ns.predicate1, ns.object1),
        rdf.quad(ns.subject2, ns.predicate2, ns.object2),
        rdf.quad(ns.subject3, ns.predicate3, ns.object3),
        rdf.quad(ns.subject4, ns.predicate4, ns.object4)
      ]
      const content = expected.map(quad => {
        return quadToNTriples(rdf.quad(quad.subject, quad.predicate, quad.object)) + '\n'
      }).join('')

      server.app.get('/', async (req, res) => {
        res.set('content-type', 'application/n-triples').send(content)
      })

      const baseUrl = await server.listen()
      const stream = get({ endpoint: baseUrl, graph: rdf.defaultGraph() })

      const actual = await array(stream)

      expected.forEach((quad, index) => {
        strictEqual(quad.equals(actual[index]), true)
      })
    })
  })

  it('should use default graph if the graph argument is a empty string', async () => {
    await withServer(async server => {
      const expected = [
        rdf.quad(ns.subject1, ns.predicate1, ns.object1),
        rdf.quad(ns.subject2, ns.predicate2, ns.object2),
        rdf.quad(ns.subject3, ns.predicate3, ns.object3),
        rdf.quad(ns.subject4, ns.predicate4, ns.object4)
      ]
      const content = expected.map(quad => {
        return quadToNTriples(rdf.quad(quad.subject, quad.predicate, quad.object)) + '\n'
      }).join('')

      server.app.get('/', async (req, res) => {
        res.set('content-type', 'application/n-triples').send(content)
      })

      const baseUrl = await server.listen()
      const stream = get({ endpoint: baseUrl, graph: '' })

      const actual = await array(stream)

      expected.forEach((quad, index) => {
        strictEqual(quad.equals(actual[index]), true)
      })
    })
  })

  it('should send a basic authentication header if user and password are given', async () => {
    await withServer(async server => {
      let credentials = null

      server.app.get('/', async (req, res) => {
        credentials = req.get('authorization')

        res.status(204).end()
      })

      const baseUrl = await server.listen()
      const stream = get({ endpoint: baseUrl, user: 'testuser', password: 'testpassword' })

      await array(stream)

      strictEqual(credentials, 'Basic dGVzdHVzZXI6dGVzdHBhc3N3b3Jk')
    })
  })

  it('should handle server errors', async () => {
    await withServer(async server => {
      server.app.get('/', async (req, res) => {
        res.status(500).end()
      })

      const baseUrl = await server.listen()
      const stream = get({ endpoint: baseUrl })

      let error = null

      try {
        await array(stream)
      } catch (err) {
        error = err
      }

      strictEqual(error && error.message.includes('Internal Server Error'), true)
    })
  })
})
