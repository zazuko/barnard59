import { ok, strictEqual } from 'node:assert'
import getStream from 'get-stream'
import { isReadableStream, isWritableStream } from 'is-stream'
import { Readable } from 'readable-stream'
import rdf from '@zazuko/env'
import { query, update } from '../inMemory.js'
import * as ns from './support/namespaces.js'

describe('query', () => {
  it('should be a function', () => {
    strictEqual(typeof query, 'function')
  })

  it('should return a readable and witable stream', () => {
    const construct = 'CONSTRUCT { ?s ?p ?o } WHERE { ?s ?p ?o }'

    const result = query(construct)

    strictEqual(isReadableStream(result), true)
    strictEqual(isWritableStream(result), true)
  })

  it('should CONSTRUCT quads', async () => {
    const chunk1 = [
      rdf.quad(ns.ex.s1, ns.ex.p, ns.ex.o1),
      rdf.quad(ns.ex.s2, ns.ex.p, ns.ex.s2),
    ]
    const chunk2 = [
      rdf.quad(ns.ex.s3, ns.ex.p, ns.ex.o3),
    ]

    const construct = query('CONSTRUCT { ?s ?p "ok" } WHERE { ?s ?p ?s }')
    const pipeline = Readable.from([chunk1, chunk2]).pipe(construct)
    const result = await getStream.array(pipeline)
    const dataset = rdf.dataset(result.flat())

    strictEqual(result.length, 2)
    strictEqual(dataset.size, 1)
    ok(dataset.has(rdf.quad(ns.ex.s2, ns.ex.p, rdf.literal('ok'))))
  })
})

describe('update', () => {
  it('should be a function', () => {
    strictEqual(typeof update, 'function')
  })

  it('should return a readable and witable stream', () => {
    const construct = 'DELETE { ?s ?p ?o } WHERE { ?s ?p ?o }'

    const result = update(construct)

    strictEqual(isReadableStream(result), true)
    strictEqual(isWritableStream(result), true)
  })
  it('should UPDATE quads', async () => {
    const chunk1 = [
      rdf.quad(ns.ex.s1, ns.ex.p, ns.ex.o1),
      rdf.quad(ns.ex.s2, ns.ex.p, ns.ex.s2),
    ]
    const chunk2 = [
      rdf.quad(ns.ex.s3, ns.ex.p, ns.ex.o3),
    ]

    const command = update('DELETE { ?s ?p ?s } WHERE { ?s ?p ?s }')
    const pipeline = Readable.from([chunk1, chunk2]).pipe(command)
    const result = await getStream.array(pipeline)

    strictEqual(result.length, 2)
    const dataset = rdf.dataset(result.flat())
    strictEqual(dataset.size, 2)
    ok(dataset.has(rdf.quad(ns.ex.s1, ns.ex.p, ns.ex.o1)))
    ok(dataset.has(rdf.quad(ns.ex.s3, ns.ex.p, ns.ex.o3)))
  })
})
