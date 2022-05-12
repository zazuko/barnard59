import rdf from 'rdf-ext'
import { Transform } from 'readable-stream'
import * as ns from './namespaces.js'
import { xsd } from './namespaces.js'

class VoidStats extends Transform {
  constructor (context, {
    voidDatasetUri,
    classPartitions,
    propertyPartitions,
    includeTotals,
    graph,
  }) {
    super({ objectMode: true })
    this.voidDatasetUri = voidDatasetUri
    this.includeTotals = includeTotals
    this.graph = graph

    this.classPartitionsCounts = new Map()
    classPartitions.forEach((current) => {
      this.classPartitionsCounts.set(current, 0)
    })

    this.propertyPartitionsCounts = new Map()
    propertyPartitions.forEach((current) => {
      this.propertyPartitionsCounts.set(current, 0)
    })

    this.totalTripleCount = 0
    this.totalEntityCount = 0
  }

  _transform (chunk, encoding, callback) {
    this.totalTripleCount++

    if (chunk.predicate.equals(ns.rdf.type)) {
      this.totalEntityCount++
      for (const [key, value] of this.classPartitionsCounts) {
        if (chunk.object.equals(key)) {
          this.classPartitionsCounts.set(key, value + 1)
        }
      }
    }

    for (const [key, value] of this.propertyPartitionsCounts) {
      if (chunk.predicate.equals(key)) {
        this.propertyPartitionsCounts.set(key, value + 1)
      }
    }

    callback(null, chunk)
  }

  async _flush (callback) {
    try {
      const datasetUri = toNamedNode(this.voidDatasetUri)
      const datasetGraph = this.graph ? toNamedNode(this.graph) : undefined

      this.push(rdf.quad(datasetUri, ns.rdf.type, ns._void.Dataset, datasetGraph))
      if (this.includeTotals) {
        this.push(rdf.quad(datasetUri, ns._void.triples, rdf.literal(this.totalTripleCount, xsd.integer), datasetGraph))
        this.push(rdf.quad(datasetUri, ns._void.entities, rdf.literal(this.totalEntityCount, xsd.integer), datasetGraph))
      }

      if (this.classPartitionsCounts.size) {
        let i = 0
        for (const [currentClass, count] of this.classPartitionsCounts) {
          const classPartitionUri = rdf.blankNode(`b_class_partition_${i}`)
          this.push(rdf.quad(datasetUri, ns._void.classPartition, classPartitionUri, datasetGraph))
          this.push(rdf.quad(classPartitionUri, ns._void.class, currentClass, datasetGraph))
          this.push(rdf.quad(classPartitionUri, ns._void.entities, rdf.literal(count, xsd.integer), datasetGraph))
          i += 1
        }
      }

      if (this.propertyPartitionsCounts.size) {
        let i = 0
        for (const [currentProperty, count] of this.propertyPartitionsCounts) {
          const propertyPartitionUri = rdf.blankNode(`b_property_partition_${i}`)
          this.push(rdf.quad(datasetUri, ns._void.propertyPartition, propertyPartitionUri, datasetGraph))
          this.push(rdf.quad(propertyPartitionUri, ns._void.property, currentProperty, datasetGraph))
          this.push(rdf.quad(propertyPartitionUri, ns._void.entities, rdf.literal(count, xsd.integer), datasetGraph))
          i += 1
        }
      }

    } catch (err) {
      this.destroy(err)
    } finally {
      callback()
    }
  }
}

function toNamedNode (item) {
  if (item === undefined) {
    return undefined
  }
  return typeof item === 'string' ? rdf.namedNode(item) : item
}

function graphStats ({
  voidDatasetUri = undefined,
  classPartitions = [],
  propertyPartitions = [],
  includeTotals = true,
  graph = undefined,
} = {}) {

  if (!voidDatasetUri) {
    throw new Error('Needs voidDatasetUri as parameter')
  }

  return new VoidStats(this, {
    voidDatasetUri: toNamedNode(voidDatasetUri),
    classPartitions: classPartitions.map(toNamedNode),
    propertyPartitions: propertyPartitions.map(toNamedNode),
    includeTotals,
    graph: toNamedNode(graph),
  })
}

export default graphStats
