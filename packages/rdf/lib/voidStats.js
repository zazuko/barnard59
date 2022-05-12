import clownface from 'clownface'
import rdf from 'rdf-ext'
import { Transform } from 'readable-stream'
import * as ns from './namespaces.js'

class VoidStats extends Transform {
  constructor (context, {
    voidDatasetUri,
    classPartitions,
    propertyPartitions,
    includeTotals,
    graph,
    createClassPartitionUri,
    createPropertyPartitionUri
  }) {
    super({ objectMode: true })
    this.voidDatasetUri = voidDatasetUri
    this.includeTotals = includeTotals
    this.graph = graph
    this.createClassPartitionUri = createClassPartitionUri
    this.createPropertyPartitionUri = createPropertyPartitionUri

    this.classPartitionsCounts = new Map()
    classPartitions.forEach(current => {
      this.classPartitionsCounts.set(current, 0)
    })

    this.propertyPartitionsCounts = new Map()
    propertyPartitions.forEach(current => {
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

      const stats = clownface({
        dataset: rdf.dataset(),
        graph: datasetGraph
      })

      stats
        .namedNode(datasetUri)
        .addOut(ns.rdf.type, ns._void.Dataset)

      if (this.includeTotals) {
        stats
          .namedNode(datasetUri)
          .addOut(ns._void.triples, this.totalTripleCount)
          .addOut(ns._void.entities, this.totalEntityCount)
      }

      if (this.classPartitionsCounts.size) {
        let index = 0
        for (const [currentClass, count] of this.classPartitionsCounts) {
          stats
            .namedNode(datasetUri)
            .addOut(ns._void.classPartition, this.createClassPartitionUri(datasetUri, index), partition => {
              partition
                .addOut(ns._void.class, currentClass)
                .addOut(ns._void.entities, count)
            })
          index += 1
        }
      }

      if (this.propertyPartitionsCounts.size) {
        let index = 0
        for (const [currentProperty, count] of this.propertyPartitionsCounts) {
          stats
            .namedNode(datasetUri)
            .addOut(ns._void.propertyPartition, this.createPropertyPartitionUri(datasetUri, index), partition => {
              partition
                .addOut(ns._void.property, currentProperty)
                .addOut(ns._void.entities, count)
            })
          index += 1
        }
      }

      for (const quad of stats.dataset) {
        this.push(quad)
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
  createClassPartitionUri = (datasetUri, index) => rdf.namedNode(`${datasetUri.value}/classPartition/${index}`),
  createPropertyPartitionUri = (datasetUri, index) => rdf.namedNode(`${datasetUri.value}/propertyPartition/${index}`)
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
    createClassPartitionUri,
    createPropertyPartitionUri
  })
}

export default graphStats
