const { strictEqual } = require('assert')
const getStream = require('get-stream')
const intoStream = require('into-stream')
const { isDuplex } = require('isstream')
const { describe, it } = require('mocha')
const rdf = require('rdf-ext')
const ns = require('./support/namespaces')
const setGraph = require('../setGraph')

describe('setGraph', () => {
  it('should be a factory', () => {
    strictEqual(typeof setGraph, 'function')
  })

  it('should return a duplex stream', () => {
    const stream = setGraph(ns.ex.graph)

    strictEqual(isDuplex(stream), true)
  })

  it('should set the graph of all quads', async () => {
    const quads = [
      rdf.quad(ns.ex.subject1, ns.ex.predicate1, ns.ex.object1, ns.ex.graph1),
      rdf.quad(ns.ex.subject2, ns.ex.predicate2, ns.ex.object2, ns.ex.graph2)
    ]

    const map = setGraph(ns.ex.graph)

    intoStream.object(quads).pipe(map)

    const result = await getStream.array(map)

    strictEqual(ns.ex.graph.equals(result[0].graph), true)
    strictEqual(ns.ex.graph.equals(result[1].graph), true)
  })

  it('should accept string values', async () => {
    const quads = [
      rdf.quad(ns.ex.subject1, ns.ex.predicate1, ns.ex.object1, ns.ex.graph1),
      rdf.quad(ns.ex.subject2, ns.ex.predicate2, ns.ex.object2, ns.ex.graph2)
    ]

    const map = setGraph(ns.ex.graph.value)

    intoStream.object(quads).pipe(map)

    const result = await getStream.array(map)

    strictEqual(ns.ex.graph.equals(result[0].graph), true)
    strictEqual(ns.ex.graph.equals(result[1].graph), true)
  })
})
