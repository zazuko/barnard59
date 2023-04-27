import { rejects, strictEqual } from 'assert'
import toNT from '@rdfjs/to-ntriples'
import clownface from 'clownface'
import getStream from 'get-stream'
import { isDuplexStream as isDuplex } from 'is-stream'
import { describe, it } from 'mocha'
import rdf from 'rdf-ext'
import { Readable } from 'readable-stream'
import toObservation from '../../lib/cube/toObservation.js'
import dateToId from '../../lib/dateToId.js'
import * as ns from '../support/namespaces.js'

function createMeasure ({ term = ns.ex('topic/a') } = {}) {
  return clownface({ dataset: rdf.dataset(), term })
}

function findObservation (result) {
  return clownface({ dataset: rdf.dataset(result[0]) }).has(ns.rdf.type, ns.cube.Observation)
}

describe('cube.toObservation', () => {
  it('should be a factory', () => {
    strictEqual(typeof toObservation, 'function')
  })

  it('should return a duplex stream', () => {
    const stream = toObservation()

    strictEqual(isDuplex(stream), true)
  })

  it('should create an observation with default values', async () => {
    const dataset = createMeasure().addOut(ns.ex.property, 'value').dataset

    const transform = toObservation()

    Readable.from([dataset]).pipe(transform)

    const result = await getStream.array(transform)
    const observation = findObservation(result)

    strictEqual(toNT(ns.ex('topic/observation/a')), toNT(observation.term)) // observation IRI
    strictEqual(toNT(rdf.literal('value')), toNT(observation.out(ns.ex.property).term)) // data
    strictEqual(toNT(ns.ex('')), toNT(observation.out(ns.cube.observedBy).term)) // observer
    strictEqual(toNT(ns.cube.Observation), toNT(observation.out(ns.rdf.type).term)) // type
    strictEqual(toNT(ns.ex('topic/observation/')), toNT(observation.in(ns.cube.observation).term)) // observation set
  })

  describe('observer', () => {
    it('should not touch an existing observer', async () => {
      const dataset = createMeasure()
        .addOut(ns.cube.observedBy, ns.ex.observer)
        .addOut(ns.ex.property, 'value')
        .dataset

      const transform = toObservation()

      Readable.from([dataset]).pipe(transform)

      const result = await getStream.array(transform)
      const observation = findObservation(result)

      strictEqual(toNT(ns.ex.observer), toNT(observation.out(ns.cube.observedBy).term))
    })

    it('should use the given observer IRI given as string', async () => {
      const dataset = createMeasure().addOut(ns.ex.property, 'value').dataset

      const transform = toObservation({ observer: ns.ex.observer.value })

      Readable.from([dataset]).pipe(transform)

      const result = await getStream.array(transform)
      const observation = findObservation(result)

      strictEqual(toNT(ns.ex.observer), toNT(observation.out(ns.cube.observedBy).term))
    })

    it('should use the given observer given as NamedNode', async () => {
      const dataset = createMeasure().addOut(ns.ex.property, 'value').dataset

      const transform = toObservation({ observer: ns.ex.observer })

      Readable.from([dataset]).pipe(transform)

      const result = await getStream.array(transform)
      const observation = findObservation(result)

      strictEqual(toNT(ns.ex.observer), toNT(observation.out(ns.cube.observedBy).term))
    })
  })

  describe('index', () => {
    it('should use an IRI with an index to generate the observation term', async () => {
      const dataset1 = createMeasure().addOut(ns.ex.property, 'value').dataset
      const dataset2 = createMeasure().addOut(ns.ex.property, 'value').dataset

      const transform = toObservation({
        useIndex: true
      })

      Readable.from([dataset1, dataset2]).pipe(transform)

      const result = await getStream.array(transform)
      const observation1 = findObservation([result[0]])
      const observation2 = findObservation([result[1]])

      strictEqual(toNT(ns.ex('topic/observation/0')), toNT(observation1.term))
      strictEqual(toNT(ns.ex('topic/observation/1')), toNT(observation2.term))
    })
  })

  describe('date', () => {
    it('should find the date by datatype if useDate is boolean true', async () => {
      const date = new Date('2020-01-01T00:00:00.000Z')
      const dataset = createMeasure()
        .addOut(ns.ex.property, 'value')
        .addOut(ns.ex.date, rdf.literal(date.toISOString(), ns.xsd.dateTime))
        .dataset

      const transform = toObservation({ useDate: true })

      Readable.from([dataset]).pipe(transform)

      const result = await getStream.array(transform)
      const observation = findObservation(result)

      strictEqual(toNT(ns.ex(`topic/observation/${dateToId(date)}`)), toNT(observation.term))
    })

    it('should find the date by datatype if useDate is string true', async () => {
      const date = new Date('2020-01-01T00:00:00.000Z')
      const dataset = createMeasure()
        .addOut(ns.ex.property, 'value')
        .addOut(ns.ex.date, rdf.literal(date.toISOString(), ns.xsd.dateTime))
        .dataset

      const transform = toObservation({ useDate: 'true' })

      Readable.from([dataset]).pipe(transform)

      const result = await getStream.array(transform)
      const observation = findObservation(result)

      strictEqual(toNT(ns.ex(`topic/observation/${dateToId(date)}`)), toNT(observation.term))
    })

    it('should throw an error if multiple objects with a data datatype are found', async () => {
      const date = new Date('2020-01-01T00:00:00.000Z')
      const dataset = createMeasure()
        .addOut(ns.ex.property, 'value')
        .addOut(ns.ex.date1, rdf.literal(date.toISOString(), ns.xsd.dateTime))
        .addOut(ns.ex.date2, rdf.literal(date.toISOString(), ns.xsd.dateTime))
        .dataset

      const transform = toObservation({ useDate: true })

      Readable.from([dataset]).pipe(transform)

      await rejects(async () => {
        await getStream.array(transform)
      })
    })

    it('should find the date using the given property IRI string', async () => {
      const date1 = new Date('2020-01-01T00:00:00.000Z')
      const date2 = new Date('2020-01-02T00:00:00.000Z')
      const date3 = new Date('2020-01-03T00:00:00.000Z')
      const dataset = createMeasure()
        .addOut(ns.ex.property, 'value')
        .addOut(ns.ex.date1, rdf.literal(date1.toISOString(), ns.xsd.dateTime))
        .addOut(ns.ex.date2, rdf.literal(date2.toISOString(), ns.xsd.dateTime))
        .addOut(ns.ex.date3, rdf.literal(date3.toISOString(), ns.xsd.dateTime))
        .dataset

      const transform = toObservation({ useDate: ns.ex.date2.value })

      Readable.from([dataset]).pipe(transform)

      const result = await getStream.array(transform)
      const observation = findObservation(result)

      strictEqual(toNT(ns.ex(`topic/observation/${dateToId(date2)}`)), toNT(observation.term))
    })

    it('should find the date using the given property', async () => {
      const date1 = new Date('2020-01-01T00:00:00.000Z')
      const date2 = new Date('2020-01-02T00:00:00.000Z')
      const date3 = new Date('2020-01-03T00:00:00.000Z')
      const dataset = createMeasure()
        .addOut(ns.ex.property, 'value')
        .addOut(ns.ex.date1, rdf.literal(date1.toISOString(), ns.xsd.dateTime))
        .addOut(ns.ex.date2, rdf.literal(date2.toISOString(), ns.xsd.dateTime))
        .addOut(ns.ex.date3, rdf.literal(date3.toISOString(), ns.xsd.dateTime))
        .dataset

      const transform = toObservation({ useDate: ns.ex.date2 })

      Readable.from([dataset]).pipe(transform)

      const result = await getStream.array(transform)
      const observation = findObservation(result)

      strictEqual(toNT(ns.ex(`topic/observation/${dateToId(date2)}`)), toNT(observation.term))
    })

    it('should use the given function to generate the date', async () => {
      const date = new Date('2020-01-01T00:00:00.000Z')
      const dataset = createMeasure().addOut(ns.ex.property, 'value').dataset

      const transform = toObservation({
        useDate: () => {
          return rdf.literal(date.toISOString(), ns.xsd.dateTime)
        }
      })

      Readable.from([dataset]).pipe(transform)

      const result = await getStream.array(transform)
      const observation = findObservation(result)

      strictEqual(toNT(ns.ex(`topic/observation/${dateToId(date)}`)), toNT(observation.term))
    })

    it('should use the current date if useDate is now', async () => {
      const dataset = createMeasure().addOut(ns.ex.property, 'value').dataset

      const transform = toObservation({ useDate: 'now' })

      Readable.from([dataset]).pipe(transform)

      const result = await getStream.array(transform)
      const observation = findObservation(result)

      strictEqual(ns.ex(`topic/observation/${dateToId(new Date())}`).value.slice(0, -4), observation.value.slice(0, -4))
    })
  })

  describe('observations', () => {
    it('should use the IRI of the observation without the observation ID extended by observation/', async () => {
      const dataset = createMeasure().addOut(ns.ex.property, 'value').dataset

      const transform = toObservation()

      Readable.from([dataset]).pipe(transform)

      const result = await getStream.array(transform)
      const observation = findObservation(result)

      strictEqual(toNT(ns.ex('topic/observation/')), toNT(observation.in(ns.cube.observation).term))
    })

    it('should not create duplicate observation/ pathes', async () => {
      const dataset = createMeasure({ term: ns.ex('topic/observation/a') }).addOut(ns.ex.property, 'value').dataset

      const transform = toObservation()

      Readable.from([dataset]).pipe(transform)

      const result = await getStream.array(transform)
      const observation = findObservation(result)

      strictEqual(toNT(ns.ex('topic/observation/')), toNT(observation.in(ns.cube.observation).term))
    })

    it('should use the given observations function to generate the observations term', async () => {
      const dataset = createMeasure().addOut(ns.ex.property, 'value').dataset

      const transform = toObservation({
        observations: () => {
          return ns.ex('observation/')
        }
      })

      Readable.from([dataset]).pipe(transform)

      const result = await getStream.array(transform)
      const observation = findObservation(result)

      strictEqual(toNT(ns.ex('observation/')), toNT(observation.in(ns.cube.observation).term))
    })

    it('should use the given observations IRI string as observation set', async () => {
      const dataset = createMeasure().addOut(ns.ex.property, 'value').dataset

      const transform = toObservation({ observations: ns.ex.observation.value })

      Readable.from([dataset]).pipe(transform)

      const result = await getStream.array(transform)
      const observation = findObservation(result)

      strictEqual(toNT(ns.ex.observation), toNT(observation.in(ns.cube.observation).term))
    })

    it('should use the given observations observation set', async () => {
      const dataset = createMeasure().addOut(ns.ex.property, 'value').dataset

      const transform = toObservation({ observations: ns.ex.observation })

      Readable.from([dataset]).pipe(transform)

      const result = await getStream.array(transform)
      const observation = findObservation(result)

      strictEqual(toNT(ns.ex.observation), toNT(observation.in(ns.cube.observation).term))
    })
  })

  describe('observation', () => {
    it('should use the given observation function to generate the observation term', async () => {
      const dataset = createMeasure().addOut(ns.ex.property, 'value').dataset

      const transform = toObservation({
        observation: () => {
          return ns.ex('observation/123')
        }
      })

      Readable.from([dataset]).pipe(transform)

      const result = await getStream.array(transform)
      const observation = findObservation(result)

      strictEqual(toNT(ns.ex('observation/123')), toNT(observation.term))
    })
  })

  describe('blacklist', () => {
    it('should delete properties given as Array of strings in the blacklist', async () => {
      const dataset = createMeasure()
        .addOut(ns.ex.property1, 'value1')
        .addOut(ns.ex.property2, 'value2')
        .addOut(ns.ex.property3, 'value3')
        .dataset

      const transform = toObservation({ blacklist: [ns.ex.property1.value, ns.ex.property3.value] })

      Readable.from([dataset]).pipe(transform)

      const result = await getStream.array(transform)
      const observation = findObservation(result)

      strictEqual(observation.out(ns.ex.property1).terms.length, 0)
      strictEqual(observation.out(ns.ex.property2).terms.length, 1)
      strictEqual(observation.out(ns.ex.property3).terms.length, 0)
    })

    it('should delete properties given as of graph pointers in the blacklist', async () => {
      const dataset = createMeasure()
        .addOut(ns.ex.property1, 'value1')
        .addOut(ns.ex.property2, 'value2')
        .addOut(ns.ex.property3, 'value3')
        .dataset

      const transform = toObservation({
        blacklist: [clownface({ term: ns.ex.property1 }), clownface({ term: ns.ex.property3 })]
      })

      Readable.from([dataset]).pipe(transform)

      const result = await getStream.array(transform)
      const observation = findObservation(result)

      strictEqual(observation.out(ns.ex.property1).terms.length, 0)
      strictEqual(observation.out(ns.ex.property2).terms.length, 1)
      strictEqual(observation.out(ns.ex.property3).terms.length, 0)
    })
  })

  describe('dimensions', () => {
    it('should fill properties given as Array of strings in dimensions with NaN if there is no value', async () => {
      const dataset = createMeasure()
        .addOut(ns.ex.property2, 'value2')
        .dataset

      const transform = toObservation({ dimensions: [ns.ex.property1.value, ns.ex.property3.value] })

      Readable.from([dataset]).pipe(transform)

      const result = await getStream.array(transform)
      const observation = findObservation(result)

      strictEqual(toNT(observation.out(ns.ex.property1).term), toNT(rdf.literal('NaN', ns.xsd.double)))
      strictEqual(toNT(observation.out(ns.ex.property2).term), toNT(rdf.literal('value2')))
      strictEqual(toNT(observation.out(ns.ex.property3).term), toNT(rdf.literal('NaN', ns.xsd.double)))
    })

    it('should fill properties given as Array of graph pointers in dimensions with NaN if there is no value', async () => {
      const dataset = createMeasure()
        .addOut(ns.ex.property2, 'value2')
        .dataset

      const transform = toObservation({
        dimensions: [clownface({ term: ns.ex.property1 }), clownface({ term: ns.ex.property3 })]
      })

      Readable.from([dataset]).pipe(transform)

      const result = await getStream.array(transform)
      const observation = findObservation(result)

      strictEqual(toNT(observation.out(ns.ex.property1).term), toNT(rdf.literal('NaN', ns.xsd.double)))
      strictEqual(toNT(observation.out(ns.ex.property2).term), toNT(rdf.literal('value2')))
      strictEqual(toNT(observation.out(ns.ex.property3).term), toNT(rdf.literal('NaN', ns.xsd.double)))
    })
  })
})
