import { strictEqual } from 'node:assert'
import { expect } from 'chai'
import assertThrows from 'assert-throws-async'
import getStream from 'get-stream'
import { isDuplexStream as isDuplex } from 'is-stream'
import rdf from 'barnard59-env'
import { Readable } from 'readable-stream'
import voidStatsUnbound from '../lib/voidStats.js'

const voidStats = voidStatsUnbound.bind({ env: rdf })

const ex = rdf.namespace('http://example.org/')
/**
 * https://www.w3.org/TR/void/#statistics
 */
describe('metadata.voidStats', () => {
  it('throws an error if no argument is given', async () => {
    await assertThrows(async () => {
      await voidStats()
    }, Error, /Needs voidDatasetUri as parameter/)
  })

  it('return a duplex stream with default values for voidDatasetUri', async () => {
    const step = await voidStats(
      {
        voidDatasetUri: ex.dataset,
      })
    strictEqual(isDuplex(step), true)
  })

  it('includes counts at the end of the stream', async () => {
    const data = [
      rdf.quad(ex.bob, rdf.ns.rdf.type, ex.Person),
      rdf.quad(ex.alice, rdf.ns.rdf.type, ex.Person),
      rdf.quad(ex.bob, ex.knows, ex.alice),
      rdf.quad(ex.alice, ex.name, rdf.literal('Alice')),
    ]
    const expectedMetadata = [
      rdf.quad(ex.dataset, rdf.ns.rdf.type, rdf.ns._void.Dataset),
      rdf.quad(ex.dataset, rdf.ns._void.triples, rdf.literal('4', rdf.ns.xsd.integer)),
      rdf.quad(ex.dataset, rdf.ns._void.entities, rdf.literal('2', rdf.ns.xsd.integer)),
    ]
    const inputStream = Readable.from(data)

    const sut = voidStats({
      voidDatasetUri: ex.dataset,
    })

    const result = await getStream.array(inputStream.pipe(sut))

    expect(result.slice(4)).to.deep.contain.all.members(expectedMetadata)
  })

  it('returns zero counts for no data', async () => {
    const data = []
    const expectedMetadata = [
      rdf.quad(ex.dataset, rdf.ns.rdf.type, rdf.ns._void.Dataset),
      rdf.quad(ex.dataset, rdf.ns._void.triples, rdf.literal('0', rdf.ns.xsd.integer)),
      rdf.quad(ex.dataset, rdf.ns._void.entities, rdf.literal('0', rdf.ns.xsd.integer)),
    ]
    const inputStream = Readable.from(data)

    const sut = voidStats({
      voidDatasetUri: ex.dataset,
    })

    const result = await getStream.array(inputStream.pipe(sut))

    expect(result).to.deep.contain.all.members(expectedMetadata)
  })

  it('returns zero counts for 0 classes', async () => {
    const data = [
      rdf.quad(ex.bob, ex.knows, ex.alice),
      rdf.quad(ex.alice, ex.name, rdf.literal('Alice')),
    ]
    const expectedMetadata = [
      rdf.quad(ex.dataset, rdf.ns.rdf.type, rdf.ns._void.Dataset),
      rdf.quad(ex.dataset, rdf.ns._void.triples, rdf.literal('2', rdf.ns.xsd.integer)),
      rdf.quad(ex.dataset, rdf.ns._void.entities, rdf.literal('0', rdf.ns.xsd.integer)),
    ]
    const inputStream = Readable.from(data)

    const sut = voidStats({
      voidDatasetUri: ex.dataset,
    })

    const result = await getStream.array(inputStream.pipe(sut))

    expect(result.slice(2)).to.deep.contain.all.members(expectedMetadata)
  })

  it('uses the named-graph given as parameter', async () => {
    const data = []
    const expectedMetadata = [
      rdf.quad(ex.dataset, rdf.ns.rdf.type, rdf.ns._void.Dataset, ex.metadata),
      rdf.quad(ex.dataset, rdf.ns._void.triples, rdf.literal('0', rdf.ns.xsd.integer), ex.metadata),
      rdf.quad(ex.dataset, rdf.ns._void.entities, rdf.literal('0', rdf.ns.xsd.integer), ex.metadata),
    ]
    const inputStream = Readable.from(data)

    const sut = voidStats({
      voidDatasetUri: ex.dataset,
      graph: ex.metadata,
    })

    const result = await getStream.array(inputStream.pipe(sut))

    expect(result).to.deep.contain.all.members(expectedMetadata)
  })

  it('does not include total counts with includeTotals: false', async () => {
    const data = [
      rdf.quad(ex.bob, ex.knows, ex.alice),
      rdf.quad(ex.alice, ex.name, rdf.literal('Alice')),
    ]
    const expectedMetadata = [
      rdf.quad(ex.dataset, rdf.ns.rdf.type, rdf.ns._void.Dataset),
    ]
    const inputStream = Readable.from(data)

    const sut = voidStats({
      voidDatasetUri: ex.dataset,
      includeTotals: false,
    })

    const result = await getStream.array(inputStream.pipe(sut))

    expect(result.slice(2)).to.deep.contain.all.members(expectedMetadata)
  })

  it('describes counts for class partitions', async () => {
    const data = [
      rdf.quad(ex.a_1, rdf.ns.rdf.type, ex.A),
      rdf.quad(ex.a_2, rdf.ns.rdf.type, ex.A),
      rdf.quad(ex.b_1, rdf.ns.rdf.type, ex.B),
      rdf.quad(ex.c_1, rdf.ns.rdf.type, ex.C),
    ]
    const partition1 = rdf.namedNode('http://example.org/dataset/classPartition/0')
    const partition2 = rdf.namedNode('http://example.org/dataset/classPartition/1')
    const expectedMetadata = [
      rdf.quad(ex.dataset, rdf.ns.rdf.type, rdf.ns._void.Dataset),
      rdf.quad(ex.dataset, rdf.ns._void.classPartition, partition1),
      rdf.quad(ex.dataset, rdf.ns._void.classPartition, partition2),
      rdf.quad(partition1, rdf.ns._void.class, ex.A),
      rdf.quad(partition1, rdf.ns._void.entities, rdf.literal('2', rdf.ns.xsd.integer)),
      rdf.quad(partition2, rdf.ns._void.class, ex.C),
      rdf.quad(partition2, rdf.ns._void.entities, rdf.literal('1', rdf.ns.xsd.integer)),
    ]
    const inputStream = Readable.from(data)

    const sut = voidStats({
      voidDatasetUri: ex.dataset,
      classPartitions: [ex.A, ex.C],
      includeTotals: false,
    })

    const result = await getStream.array(inputStream.pipe(sut))

    expect(result.slice(4)).to.deep.contain.all.members(expectedMetadata)
  })

  it('describe counts for class partitions with no matches', async () => {
    const data = []
    const partition1 = rdf.namedNode('http://example.org/dataset/classPartition/0')
    const partition2 = rdf.namedNode('http://example.org/dataset/classPartition/1')
    const expectedMetadata = [
      rdf.quad(ex.dataset, rdf.ns.rdf.type, rdf.ns._void.Dataset),
      rdf.quad(ex.dataset, rdf.ns._void.classPartition, partition1),
      rdf.quad(ex.dataset, rdf.ns._void.classPartition, partition2),
      rdf.quad(partition1, rdf.ns._void.class, ex.A),
      rdf.quad(partition1, rdf.ns._void.entities, rdf.literal('0', rdf.ns.xsd.integer)),
      rdf.quad(partition2, rdf.ns._void.class, ex.C),
      rdf.quad(partition2, rdf.ns._void.entities, rdf.literal('0', rdf.ns.xsd.integer)),
    ]
    const inputStream = Readable.from(data)

    const sut = voidStats({
      voidDatasetUri: ex.dataset,
      classPartitions: [ex.A, ex.C],
      includeTotals: false,
    })

    const result = await getStream.array(inputStream.pipe(sut))

    expect(result).to.deep.contain.all.members(expectedMetadata)
  })

  it('describe counts for property partitions', async () => {
    const data = [
      rdf.quad(ex.a, ex.p_1, ex.b),
      rdf.quad(ex.a, ex.p_1, ex.b),
      rdf.quad(ex.a, ex.p_2, ex.b),
      rdf.quad(ex.a, ex.p_3, ex.b),
    ]
    const partition1 = rdf.namedNode('http://example.org/dataset/propertyPartition/0')
    const partition2 = rdf.namedNode('http://example.org/dataset/propertyPartition/1')
    const expectedMetadata = [
      rdf.quad(ex.dataset, rdf.ns.rdf.type, rdf.ns._void.Dataset),
      rdf.quad(ex.dataset, rdf.ns._void.propertyPartition, partition1),
      rdf.quad(ex.dataset, rdf.ns._void.propertyPartition, partition2),
      rdf.quad(partition1, rdf.ns._void.property, ex.p_1),
      rdf.quad(partition1, rdf.ns._void.entities, rdf.literal('2', rdf.ns.xsd.integer)),
      rdf.quad(partition2, rdf.ns._void.property, ex.p_3),
      rdf.quad(partition2, rdf.ns._void.entities, rdf.literal('1', rdf.ns.xsd.integer)),
    ]
    const inputStream = Readable.from(data)

    const sut = voidStats({
      voidDatasetUri: ex.dataset,
      propertyPartitions: [ex.p_1, ex.p_3],
      includeTotals: false,
    })

    const result = await getStream.array(inputStream.pipe(sut))

    expect(result.slice(4)).to.deep.contain.all.members(expectedMetadata)
  })

  it('describe counts for property partitions with no matches', async () => {
    const data = []
    const partition1 = rdf.namedNode('http://example.org/dataset/propertyPartition/0')
    const partition2 = rdf.namedNode('http://example.org/dataset/propertyPartition/1')
    const expectedMetadata = [
      rdf.quad(ex.dataset, rdf.ns.rdf.type, rdf.ns._void.Dataset),
      rdf.quad(ex.dataset, rdf.ns._void.propertyPartition, partition1),
      rdf.quad(ex.dataset, rdf.ns._void.propertyPartition, partition2),
      rdf.quad(partition1, rdf.ns._void.property, ex.p_1),
      rdf.quad(partition1, rdf.ns._void.entities, rdf.literal('0', rdf.ns.xsd.integer)),
      rdf.quad(partition2, rdf.ns._void.property, ex.p_3),
      rdf.quad(partition2, rdf.ns._void.entities, rdf.literal('0', rdf.ns.xsd.integer)),
    ]
    const inputStream = Readable.from(data)

    const sut = voidStats({
      voidDatasetUri: ex.dataset,
      includeTotals: false,
      propertyPartitions: [ex.p_1, ex.p_3],
    })

    const result = await getStream.array(inputStream.pipe(sut))

    expect(result).to.deep.contain.all.members(expectedMetadata)
  })

  it('accepts string parameters', async () => {
    const data = [
      rdf.quad(ex.a_1, rdf.ns.rdf.type, ex.A),
      rdf.quad(ex.a_2, rdf.ns.rdf.type, ex.A),
      rdf.quad(ex.b_1, rdf.ns.rdf.type, ex.B),
      rdf.quad(ex.c_1, rdf.ns.rdf.type, ex.C),
      rdf.quad(ex.a, ex.p_1, ex.b),
      rdf.quad(ex.a, ex.p_1, ex.b),
      rdf.quad(ex.a, ex.p_2, ex.b),
      rdf.quad(ex.a, ex.p_3, ex.b),
    ]
    const inputStream = Readable.from(data)

    const sut = voidStats({
      voidDatasetUri: ex.dataset.value,
      propertyPartitions: [ex.p_1.value, ex.p_3.value],
      graph: ex.graph.value,
      includeTotals: true,
    })

    const result = await getStream.array(inputStream.pipe(sut))

    strictEqual(result.length, 17)

    for (const quad of result.slice(8)) {
      strictEqual(quad.graph.equals(ex.graph), true)
    }
  })
})
