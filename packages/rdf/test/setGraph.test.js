import { strictEqual } from 'assert'
import getStream from 'get-stream'
import { isDuplex } from 'isstream'
import { describe, it } from 'mocha'
import rdf from 'rdf-ext'
import { Readable } from 'readable-stream'
import setGraph from '../setGraph.js'
import * as ns from './support/namespaces.js'

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

    Readable.from(quads).pipe(map)

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

    Readable.from(quads).pipe(map)

    const result = await getStream.array(map)

    strictEqual(ns.ex.graph.equals(result[0].graph), true)
    strictEqual(ns.ex.graph.equals(result[1].graph), true)
  })

  it('should use default graph if an empty string is given', async () => {
    const quads = [
      rdf.quad(ns.ex.subject, ns.ex.predicate, ns.ex.object, ns.ex.graph)
    ]

    const map = setGraph('')

    Readable.from(quads).pipe(map)

    const result = await getStream.array(map)

    strictEqual(rdf.defaultGraph().equals(result[0].graph), true)
  })

  it('should use default graph if null is given', async () => {
    const quads = [
      rdf.quad(ns.ex.subject, ns.ex.predicate, ns.ex.object, ns.ex.graph)
    ]

    const map = setGraph(null)

    Readable.from(quads).pipe(map)

    const result = await getStream.array(map)

    strictEqual(rdf.defaultGraph().equals(result[0].graph), true)
  })

  it('should use default graph if undefined is given', async () => {
    const quads = [
      rdf.quad(ns.ex.subject, ns.ex.predicate, ns.ex.object, ns.ex.graph)
    ]

    const map = setGraph()

    Readable.from(quads).pipe(map)

    const result = await getStream.array(map)

    strictEqual(rdf.defaultGraph().equals(result[0].graph), true)
  })
})
