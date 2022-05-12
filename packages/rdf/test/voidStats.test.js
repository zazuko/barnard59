import { strictEqual } from 'assert'
import namespace from '@rdfjs/namespace'
import assertThrows from 'assert-throws-async'
import getStream from 'get-stream'
import { isDuplex } from 'isstream'
import { describe, it } from 'mocha'
import rdf from 'rdf-ext'
import { Readable } from 'readable-stream'
import * as ns from '../lib/namespaces.js'
import voidStats from '../lib/voidStats.js'

const ex = namespace('http://example.org/')
/**
 * https://www.w3.org/TR/void/#statistics
 */
describe('metadata.voidStats', () => {
  it('should be a factory', () => {
    strictEqual(typeof voidStats, 'function')
  })

  it('should throw an error if no argument is given', async () => {
    await assertThrows(async () => {
      await voidStats()
    }, Error, /Needs voidDatasetUri as parameter/)
  })

  it('should return a duplex stream with default values for voidDatasetUri', async () => {
    const step = await voidStats(
      {
        voidDatasetUri: ex.dataset
      })
    strictEqual(isDuplex(step), true)
  })

  function toN3 (quads) {
    const dataset = rdf.dataset().addAll(quads)
    return dataset.toString()
  }

  it('should include counts at the end of the stream', async () => {
    const data = [
      rdf.quad(ex.bob, ns.rdf.type, ex.Person),
      rdf.quad(ex.alice, ns.rdf.type, ex.Person),
      rdf.quad(ex.bob, ex.knows, ex.alice),
      rdf.quad(ex.alice, ex.name, rdf.literal('Alice'))
    ]
    const expectedMetadata = [
      rdf.quad(ex.dataset, ns.rdf.type, ns._void.Dataset),
      rdf.quad(ex.dataset, ns._void.triples, rdf.literal(4, ns.xsd.integer)),
      rdf.quad(ex.dataset, ns._void.entities, rdf.literal(2, ns.xsd.integer))
    ]
    const inputStream = Readable.from(data)

    const sut = voidStats({
      voidDatasetUri: ex.dataset
    })

    const result = await getStream.array(inputStream.pipe(sut))

    strictEqual(result.length, 7)
    strictEqual(toN3(result.slice(4)), toN3(expectedMetadata), true)
  })

  it('should return zero counts for no data', async () => {
    const data = []
    const expectedMetadata = [
      rdf.quad(ex.dataset, ns.rdf.type, ns._void.Dataset),
      rdf.quad(ex.dataset, ns._void.triples, rdf.literal(0, ns.xsd.integer)),
      rdf.quad(ex.dataset, ns._void.entities, rdf.literal(0, ns.xsd.integer))
    ]
    const inputStream = Readable.from(data)

    const sut = voidStats({
      voidDatasetUri: ex.dataset
    })

    const result = await getStream.array(inputStream.pipe(sut))

    strictEqual(toN3(result), toN3(expectedMetadata), true)
  })

  it('No classes result in entity count 0', async () => {
    const data = [
      rdf.quad(ex.bob, ex.knows, ex.alice),
      rdf.quad(ex.alice, ex.name, rdf.literal('Alice'))
    ]
    const expectedMetadata = [
      rdf.quad(ex.dataset, ns.rdf.type, ns._void.Dataset),
      rdf.quad(ex.dataset, ns._void.triples, rdf.literal(2, ns.xsd.integer)),
      rdf.quad(ex.dataset, ns._void.entities, rdf.literal(0, ns.xsd.integer))
    ]
    const inputStream = Readable.from(data)

    const sut = voidStats({
      voidDatasetUri: ex.dataset
    })

    const result = await getStream.array(inputStream.pipe(sut))

    strictEqual(result.length, 5)
    strictEqual(toN3(result.slice(2)), toN3(expectedMetadata), true)
  })

  it('metadata use the graph defined as parameter', async () => {
    const data = []
    const expectedMetadata = [
      rdf.quad(ex.dataset, ns.rdf.type, ns._void.Dataset, ex.metadata),
      rdf.quad(ex.dataset, ns._void.triples, rdf.literal(0, ns.xsd.integer), ex.metadata),
      rdf.quad(ex.dataset, ns._void.entities, rdf.literal(0, ns.xsd.integer), ex.metadata)
    ]
    const inputStream = Readable.from(data)

    const sut = voidStats({
      voidDatasetUri: ex.dataset,
      graph: ex.metadata
    })

    const result = await getStream.array(inputStream.pipe(sut))
    strictEqual(toN3(result), toN3(expectedMetadata), true)
  })

  it('should not include total counts with includeTotals: false', async () => {
    const data = [
      rdf.quad(ex.bob, ex.knows, ex.alice),
      rdf.quad(ex.alice, ex.name, rdf.literal('Alice'))
    ]
    const expectedMetadata = [
      rdf.quad(ex.dataset, ns.rdf.type, ns._void.Dataset)
    ]
    const inputStream = Readable.from(data)

    const sut = voidStats({
      voidDatasetUri: ex.dataset,
      includeTotals: false
    })

    const result = await getStream.array(inputStream.pipe(sut))

    strictEqual(result.length, 3)
    strictEqual(toN3(result.slice(2)), toN3(expectedMetadata), true)
  })

  it('should describe counts for class partitions', async () => {
    const data = [
      rdf.quad(ex.a_1, ns.rdf.type, ex.A),
      rdf.quad(ex.a_2, ns.rdf.type, ex.A),
      rdf.quad(ex.b_1, ns.rdf.type, ex.B),
      rdf.quad(ex.c_1, ns.rdf.type, ex.C)
    ]
    const expectedMetadata = [
      rdf.quad(ex.dataset, ns.rdf.type, ns._void.Dataset),
      rdf.quad(ex.dataset, ns._void.classPartition, rdf.blankNode('b_class_partition_0')),
      rdf.quad(ex.dataset, ns._void.classPartition, rdf.blankNode('b_class_partition_1')),
      rdf.quad(rdf.blankNode('b_class_partition_0'), ns._void.class, ex.A),
      rdf.quad(rdf.blankNode('b_class_partition_0'), ns._void.entities, rdf.literal(2, ns.xsd.integer)),
      rdf.quad(rdf.blankNode('b_class_partition_1'), ns._void.class, ex.C),
      rdf.quad(rdf.blankNode('b_class_partition_1'), ns._void.entities, rdf.literal(1, ns.xsd.integer))
    ]
    const inputStream = Readable.from(data)

    const sut = voidStats({
      voidDatasetUri: ex.dataset,
      classPartitions: [ex.A, ex.C],
      includeTotals: false
    })
    const result = await getStream.array(inputStream.pipe(sut))
    strictEqual(result.length, 11)
    strictEqual(toN3(result.slice(4)), toN3(expectedMetadata), true)
  })

  it('should describe counts for class partitions with no matches', async () => {
    const data = []
    const expectedMetadata = [
      rdf.quad(ex.dataset, ns.rdf.type, ns._void.Dataset),
      rdf.quad(ex.dataset, ns._void.classPartition, rdf.blankNode('b_class_partition_0')),
      rdf.quad(ex.dataset, ns._void.classPartition, rdf.blankNode('b_class_partition_1')),
      rdf.quad(rdf.blankNode('b_class_partition_0'), ns._void.class, ex.A),
      rdf.quad(rdf.blankNode('b_class_partition_0'), ns._void.entities, rdf.literal(0, ns.xsd.integer)),
      rdf.quad(rdf.blankNode('b_class_partition_1'), ns._void.class, ex.C),
      rdf.quad(rdf.blankNode('b_class_partition_1'), ns._void.entities, rdf.literal(0, ns.xsd.integer))
    ]
    const inputStream = Readable.from(data)

    const sut = voidStats({
      voidDatasetUri: ex.dataset,
      classPartitions: [ex.A, ex.C],
      includeTotals: false
    })
    const result = await getStream.array(inputStream.pipe(sut))
    strictEqual(result.length, 7)
    strictEqual(toN3(result), toN3(expectedMetadata), true)
  })

  it('should describe counts for property partitions', async () => {
    const data = [
      rdf.quad(ex.a, ex.p_1, ex.b),
      rdf.quad(ex.a, ex.p_1, ex.b),
      rdf.quad(ex.a, ex.p_2, ex.b),
      rdf.quad(ex.a, ex.p_3, ex.b)
    ]
    const expectedMetadata = [
      rdf.quad(ex.dataset, ns.rdf.type, ns._void.Dataset),
      rdf.quad(ex.dataset, ns._void.propertyPartition, rdf.blankNode('b_property_partition_0')),
      rdf.quad(ex.dataset, ns._void.propertyPartition, rdf.blankNode('b_property_partition_1')),
      rdf.quad(rdf.blankNode('b_property_partition_0'), ns._void.property, ex.p_1),
      rdf.quad(rdf.blankNode('b_property_partition_0'), ns._void.entities, rdf.literal(2, ns.xsd.integer)),
      rdf.quad(rdf.blankNode('b_property_partition_1'), ns._void.property, ex.p_3),
      rdf.quad(rdf.blankNode('b_property_partition_1'), ns._void.entities, rdf.literal(1, ns.xsd.integer))
    ]
    const inputStream = Readable.from(data)

    const sut = voidStats({
      voidDatasetUri: ex.dataset,
      propertyPartitions: [ex.p_1, ex.p_3],
      includeTotals: false
    })
    const result = await getStream.array(inputStream.pipe(sut))
    strictEqual(result.length, 11)
    strictEqual(toN3(result.slice(4)), toN3(expectedMetadata), true)
  })

  it('should describe counts for property partitions with no matches', async () => {
    const data = []
    const expectedMetadata = [
      rdf.quad(ex.dataset, ns.rdf.type, ns._void.Dataset),
      rdf.quad(ex.dataset, ns._void.propertyPartition, rdf.blankNode('b_property_partition_0')),
      rdf.quad(ex.dataset, ns._void.propertyPartition, rdf.blankNode('b_property_partition_1')),
      rdf.quad(rdf.blankNode('b_property_partition_0'), ns._void.property, ex.p_1),
      rdf.quad(rdf.blankNode('b_property_partition_0'), ns._void.entities, rdf.literal(0, ns.xsd.integer)),
      rdf.quad(rdf.blankNode('b_property_partition_1'), ns._void.property, ex.p_3),
      rdf.quad(rdf.blankNode('b_property_partition_1'), ns._void.entities, rdf.literal(0, ns.xsd.integer))
    ]
    const inputStream = Readable.from(data)

    const sut = voidStats({
      voidDatasetUri: ex.dataset,
      includeTotals: false,
      propertyPartitions: [ex.p_1, ex.p_3]
    })
    const result = await getStream.array(inputStream.pipe(sut))
    strictEqual(result.length, 7)
    strictEqual(toN3(result), toN3(expectedMetadata), true)
  })

  it('accepts string parameters', async () => {
    const data = [
      rdf.quad(ex.a_1, ns.rdf.type, ex.A),
      rdf.quad(ex.a_2, ns.rdf.type, ex.A),
      rdf.quad(ex.b_1, ns.rdf.type, ex.B),
      rdf.quad(ex.c_1, ns.rdf.type, ex.C),
      rdf.quad(ex.a, ex.p_1, ex.b),
      rdf.quad(ex.a, ex.p_1, ex.b),
      rdf.quad(ex.a, ex.p_2, ex.b),
      rdf.quad(ex.a, ex.p_3, ex.b)
    ]
    const inputStream = Readable.from(data)

    const sut = voidStats({
      voidDatasetUri: ex.dataset.value,
      propertyPartitions: [ex.p_1.value, ex.p_3.value],
      graph: ex.graph.value,
      includeTotals: true
    })
    const result = await getStream.array(inputStream.pipe(sut))
    strictEqual(result.length, 17)

    for (const quad of result.slice(8)) {
      strictEqual(quad.graph.equals(ex.graph), true)
    }
  })
})
