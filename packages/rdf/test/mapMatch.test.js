import { strictEqual } from 'assert'
import getStream from 'get-stream'
import { isDuplexStream } from 'is-stream'
import rdf from 'barnard59-env'
import { Readable } from 'readable-stream'
import mapMatch from '../mapMatch.js'
import * as ns from './support/namespaces.js'

describe('mapMatch', () => {
  it('should be a factory', () => {
    strictEqual(typeof mapMatch, 'function')
  })

  it('should return a duplex stream', () => {
    const stream = mapMatch({ predicate: '', map: () => {} })

    strictEqual(isDuplexStream(stream), true)
  })

  it('should not touch any quads not matching the pattern', async () => {
    const quads = [
      rdf.quad(ns.ex.subject1, ns.ex.predicate1, ns.ex.object1, ns.ex.graph1),
      rdf.quad(ns.ex.subject2, ns.ex.predicate2, ns.ex.object2, ns.ex.graph2),
    ]

    const map = mapMatch({
      predicate: ns.ex.map,
      map: () => rdf.quad(ns.ex.mapped, ns.ex.mapped, ns.ex.mapped),
    })

    Readable.from(quads).pipe(map)

    const result = await getStream.array(map)

    strictEqual(quads[0].equals(result[0]), true)
    strictEqual(quads[1].equals(result[1]), true)
  })

  it('should touch only the quads matching the pattern', async () => {
    const quads = [
      rdf.quad(ns.ex.subject1, ns.ex.predicate1, ns.ex.object1, ns.ex.graph1),
      rdf.quad(ns.ex.subject2, ns.ex.predicate2, ns.ex.object2, ns.ex.graph2),
      rdf.quad(ns.ex.subject3, ns.ex.predicate3, ns.ex.object3, ns.ex.graph3),
    ]
    const mapped = rdf.quad(ns.ex.mapped, ns.ex.mapped, ns.ex.mapped)

    const map = mapMatch({
      subject: ns.ex.subject2,
      predicate: ns.ex.predicate2,
      object: ns.ex.object2,
      graph: ns.ex.graph2,
      map: () => mapped,
    })

    Readable.from(quads).pipe(map)

    const result = await getStream.array(map)

    strictEqual(mapped.equals(result[0]), false)
    strictEqual(mapped.equals(result[1]), true)
    strictEqual(mapped.equals(result[2]), false)
  })

  it('should support multiple terms given as an iterable', async () => {
    const quads = [
      rdf.quad(ns.ex.subject1, ns.ex.predicate1, ns.ex.object1, ns.ex.graph1),
      rdf.quad(ns.ex.subject2, ns.ex.predicate2, ns.ex.object2, ns.ex.graph2),
      rdf.quad(ns.ex.subject3, ns.ex.predicate3, ns.ex.object3, ns.ex.graph3),
    ]
    const mapped = rdf.quad(ns.ex.mapped, ns.ex.mapped, ns.ex.mapped)

    const map = mapMatch({
      subject: [ns.ex.subject1, ns.ex.subject2],
      predicate: [ns.ex.predicate1, ns.ex.predicate2],
      object: [ns.ex.object1, ns.ex.object2],
      graph: [ns.ex.graph1, ns.ex.graph2],
      map: () => mapped,
    })

    Readable.from(quads).pipe(map)

    const result = await getStream.array(map)

    strictEqual(mapped.equals(result[0]), true)
    strictEqual(mapped.equals(result[1]), true)
    strictEqual(mapped.equals(result[2]), false)
  })

  it('should support async map functions', async () => {
    const quads = [
      rdf.quad(ns.ex.subject1, ns.ex.predicate1, ns.ex.object1, ns.ex.graph1),
    ]
    const mapped = rdf.quad(ns.ex.mapped, ns.ex.mapped, ns.ex.mapped)

    const map = mapMatch({
      subject: ns.ex.subject1,
      map: async () => mapped,
    })

    Readable.from(quads).pipe(map)

    const result = await getStream.array(map)

    strictEqual(mapped.equals(result[0]), true)
  })

  it('should give the quad to the map function', async () => {
    const seen = []
    const quads = [
      rdf.quad(ns.ex.subject1, ns.ex.predicate1, ns.ex.object1, ns.ex.graph1),
      rdf.quad(ns.ex.subject2, ns.ex.predicate2, ns.ex.object2, ns.ex.graph2),
    ]
    const mapped = rdf.quad(ns.ex.mapped, ns.ex.mapped, ns.ex.mapped)

    const map = mapMatch({
      subject: [ns.ex.subject1, ns.ex.subject2],
      map: quad => {
        seen.push(quad)

        return mapped
      },
    })

    Readable.from(quads).pipe(map)

    await getStream.array(map)

    strictEqual(quads[0].equals(seen[0]), true)
    strictEqual(quads[1].equals(seen[1]), true)
  })

  it('should assign @zazuko/env as rdf to the this context', async () => {
    let context = null
    const quads = [
      rdf.quad(ns.ex.subject1, ns.ex.predicate1, ns.ex.object1, ns.ex.graph1),
    ]
    const mapped = rdf.quad(ns.ex.mapped, ns.ex.mapped, ns.ex.mapped)

    const map = mapMatch({
      subject: ns.ex.subject1,
      map: function () {
        context = this

        return mapped
      },
    })

    Readable.from(quads).pipe(map)

    await getStream.array(map)

    strictEqual(context.rdf, rdf)
  })
})
