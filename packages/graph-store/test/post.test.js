/* global describe, expect, test */

const { post } = require('..')
const { isReadable, isWritable } = require('isstream')
const namespace = require('@rdfjs/namespace')
const rdf = require('@rdfjs/data-model')
const { finished } = require('readable-stream')
const streamToString = require('./support/streamToString')
const { quadToNTriples } = require('@rdfjs/to-ntriples')
const { promisify } = require('util')
const ExpressAsPromise = require('express-as-promise')

const ns = namespace('http://example.org/')

describe('post', () => {
  test('returns a writable stream', async () => {
    const server = new ExpressAsPromise()
    const baseUrl = await server.listen()

    const stream = await post({ endpoint: baseUrl })

    expect(isReadable(stream)).toBe(false)
    expect(isWritable(stream)).toBe(true)

    stream.end()

    await server.stop()
  })

  test('sends a POST request', async () => {
    let called = false
    const quad = rdf.quad(ns.subject1, ns.predicate1, ns.object1, ns.graph1)

    const server = new ExpressAsPromise()

    server.app.post('/', async (req, res) => {
      called = true

      res.status(204).end()
    })

    const baseUrl = await server.listen()
    const stream = await post({ endpoint: baseUrl })

    stream.write(quad)
    stream.end()

    await promisify(finished)(stream)

    expect(called).toBe(true)

    await server.stop()
  })

  test('sends content with media type application/n-triples to the server', async () => {
    let mediaType = null
    const quad = rdf.quad(ns.subject1, ns.predicate1, ns.object1, ns.graph1)

    const server = new ExpressAsPromise()

    server.app.post('/', async (req, res) => {
      mediaType = req.get('content-type')

      res.status(204).end()
    })

    const baseUrl = await server.listen()
    const stream = await post({ endpoint: baseUrl })

    stream.write(quad)
    stream.end()

    await promisify(finished)(stream)

    expect(mediaType).toBe('application/n-triples')

    await server.stop()
  })

  test('sends the quad stream as N-Triples to the server', async () => {
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

    const server = new ExpressAsPromise()

    server.app.post('/', async (req, res) => {
      content[req.query.graph] = await streamToString(req)

      res.status(204).end()
    })

    const baseUrl = await server.listen()
    const stream = await post({ endpoint: baseUrl })

    quads.forEach(quad => {
      stream.write(quad)
    })

    stream.end()

    await promisify(finished)(stream)

    expect(content[quads[0].graph.value]).toBe(expected)

    await server.stop()
  })

  test('supports default graph', async () => {
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

    const server = new ExpressAsPromise()

    server.app.post('/', async (req, res) => {
      graph = req.query.graph
      content = await streamToString(req)

      res.status(204).end()
    })

    const baseUrl = await server.listen()
    const stream = await post({ endpoint: baseUrl })

    quads.forEach(quad => {
      stream.write(quad)
    })

    stream.end()

    await promisify(finished)(stream)

    expect(graph).toBe(undefined)
    expect(content).toBe(expected)

    await server.stop()
  })

  test('should use multiple request to send multiple graphs', async () => {
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

    const server = new ExpressAsPromise()

    server.app.post('/', async (req, res) => {
      content[typeof req.query.graph === 'string' ? req.query.graph : 'default'] = await streamToString(req)

      res.status(204).end()
    })

    const baseUrl = await server.listen()
    const stream = await post({ endpoint: baseUrl })

    quads.forEach(quad => {
      stream.write(quad)
    })

    stream.end()

    await promisify(finished)(stream)

    expect(content).toStrictEqual(expected)

    await server.stop()
  })

  test('sends basic authentication headers', async () => {
    let credentials = null
    const quad = rdf.quad(ns.subject1, ns.predicate1, ns.object1, ns.graph1)

    const server = new ExpressAsPromise()

    server.app.post('/', async (req, res) => {
      credentials = req.get('authorization')

      res.status(204).end()
    })

    const baseUrl = await server.listen()
    const stream = await post({ endpoint: baseUrl, user: 'testuser', password: 'testpassword' })

    stream.write(quad)
    stream.end()

    await promisify(finished)(stream)

    expect(credentials).toBe('Basic dGVzdHVzZXI6dGVzdHBhc3N3b3Jk')

    await server.stop()
  })
})
