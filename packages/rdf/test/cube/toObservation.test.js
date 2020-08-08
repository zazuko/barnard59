const { strictEqual } = require('assert')
const clownface = require('clownface')
const getStream = require('get-stream')
const intoStream = require('into-stream')
const { isDuplex } = require('isstream')
const { describe, it } = require('mocha')
const rdf = require('rdf-ext')
const namespace = require('@rdfjs/namespace')
const TermSet = require('@rdfjs/term-set')
const dateToId = require('../../lib/dateToId')
const toObservation = require('../../lib/cube/toObservation')

const ns = {
  cube: namespace('http://ns.bergnet.org/cube/'),
  ex: namespace('http://example.org/'),
  rdf: namespace('http://www.w3.org/1999/02/22-rdf-syntax-ns#'),
  xsd: namespace('http://www.w3.org/2001/XMLSchema#')
}

function findObservation (result) {
  return clownface({ dataset: result[0] }).has(ns.rdf.type, ns.cube.Observation)
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
    const dataset = clownface({ dataset: rdf.dataset(), term: ns.ex.measure })
      .addOut(ns.ex.property, 'value')
      .dataset

    const transform = toObservation()

    intoStream.object([dataset]).pipe(transform)

    const result = await getStream.array(transform)
    const observation = findObservation(result)

    strictEqual(ns.ex('measure/observation/0').equals(observation.term), true) // observation IRI
    strictEqual(rdf.literal('value').equals(observation.out(ns.ex.property).term), true) // data
    strictEqual(ns.ex.measure.equals(observation.out(ns.cube.observedBy).term), true) // observer
    strictEqual(ns.cube.Observation.equals(observation.out(ns.rdf.type).term), true) // type
    strictEqual(ns.ex('measure/observation').equals(observation.in(ns.cube.observation).term), true) // observation set
  })

  it('should use the index to create observation IRIs', async () => {
    const dataset1 = clownface({ dataset: rdf.dataset(), term: ns.ex.measure })
      .addOut(ns.ex.property, 'value')
      .dataset
    const dataset2 = clownface({ dataset: rdf.dataset(), term: ns.ex.measure })
      .addOut(ns.ex.property, 'value')
      .dataset

    const transform = toObservation()

    intoStream.object([dataset1, dataset2]).pipe(transform)

    const result = await getStream.array(transform)
    const observation1 = findObservation([result[0]])
    const observation2 = findObservation([result[1]])

    strictEqual(ns.ex('measure/observation/0').equals(observation1.term), true)
    strictEqual(ns.ex('measure/observation/1').equals(observation2.term), true)
  })

  describe('observer', () => {
    it('should not touch an existing observer', async () => {
      const dataset = clownface({ dataset: rdf.dataset(), term: ns.ex.measure })
        .addOut(ns.cube.observedBy, ns.ex.observer)
        .addOut(ns.ex.property, 'value')
        .dataset

      const transform = toObservation()

      intoStream.object([dataset]).pipe(transform)

      const result = await getStream.array(transform)
      const observation = findObservation(result)

      strictEqual(ns.ex.observer.equals(observation.out(ns.cube.observedBy).term), true)
    })

    it('should use the given observer IRI given as string', async () => {
      const dataset = clownface({ dataset: rdf.dataset(), term: ns.ex.measure })
        .addOut(ns.ex.property, 'value')
        .dataset

      const transform = toObservation({ observer: ns.ex.observer.value })

      intoStream.object([dataset]).pipe(transform)

      const result = await getStream.array(transform)
      const observation = findObservation(result)

      strictEqual(ns.ex.observer.equals(observation.out(ns.cube.observedBy).term), true)
    })

    it('should use the given observer given as NamedNode', async () => {
      const dataset = clownface({ dataset: rdf.dataset(), term: ns.ex.measure })
        .addOut(ns.ex.property, 'value')
        .dataset

      const transform = toObservation({ observer: ns.ex.observer })

      intoStream.object([dataset]).pipe(transform)

      const result = await getStream.array(transform)
      const observation = findObservation(result)

      strictEqual(ns.ex.observer.equals(observation.out(ns.cube.observedBy).term), true)
    })
  })

  describe('date', () => {
    it('should find the date by datatype', async () => {
      const date = new Date('2020-01-01T00:00:00.000Z')
      const dataset = clownface({ dataset: rdf.dataset(), term: ns.ex.measure })
        .addOut(ns.ex.property, 'value')
        .addOut(ns.ex.date, rdf.literal(date.toISOString(), ns.xsd.dateTime))
        .dataset

      const transform = toObservation()

      intoStream.object([dataset]).pipe(transform)

      const result = await getStream.array(transform)
      const observation = findObservation(result)

      strictEqual(ns.ex(`measure/observation/${dateToId(date)}`).equals(observation.term), true)
    })

    it('should ignore multiple values with dateTime datatype', async () => {
      const date = new Date('2020-01-01T00:00:00.000Z')
      const dataset = clownface({ dataset: rdf.dataset(), term: ns.ex.measure })
        .addOut(ns.ex.property, 'value')
        .addOut(ns.ex.date1, rdf.literal(date.toISOString(), ns.xsd.dateTime))
        .addOut(ns.ex.date2, rdf.literal(date.toISOString(), ns.xsd.dateTime))
        .dataset

      const transform = toObservation()

      intoStream.object([dataset]).pipe(transform)

      const result = await getStream.array(transform)
      const observation = findObservation(result)

      strictEqual(ns.ex('measure/observation/0').equals(observation.term), true)
    })

    it('should find the date using the given property IRI string', async () => {
      const date1 = new Date('2020-01-01T00:00:00.000Z')
      const date2 = new Date('2020-01-02T00:00:00.000Z')
      const date3 = new Date('2020-01-03T00:00:00.000Z')
      const dataset = clownface({ dataset: rdf.dataset(), term: ns.ex.measure })
        .addOut(ns.ex.property, 'value')
        .addOut(ns.ex.date1, rdf.literal(date1.toISOString(), ns.xsd.dateTime))
        .addOut(ns.ex.date2, rdf.literal(date2.toISOString(), ns.xsd.dateTime))
        .addOut(ns.ex.date3, rdf.literal(date3.toISOString(), ns.xsd.dateTime))
        .dataset

      const transform = toObservation({ date: ns.ex.date2.value })

      intoStream.object([dataset]).pipe(transform)

      const result = await getStream.array(transform)
      const observation = findObservation(result)

      strictEqual(ns.ex(`measure/observation/${dateToId(date2)}`).equals(observation.term), true)
    })

    it('should find the date using the given property', async () => {
      const date1 = new Date('2020-01-01T00:00:00.000Z')
      const date2 = new Date('2020-01-02T00:00:00.000Z')
      const date3 = new Date('2020-01-03T00:00:00.000Z')
      const dataset = clownface({ dataset: rdf.dataset(), term: ns.ex.measure })
        .addOut(ns.ex.property, 'value')
        .addOut(ns.ex.date1, rdf.literal(date1.toISOString(), ns.xsd.dateTime))
        .addOut(ns.ex.date2, rdf.literal(date2.toISOString(), ns.xsd.dateTime))
        .addOut(ns.ex.date3, rdf.literal(date3.toISOString(), ns.xsd.dateTime))
        .dataset

      const transform = toObservation({ date: ns.ex.date2 })

      intoStream.object([dataset]).pipe(transform)

      const result = await getStream.array(transform)
      const observation = findObservation(result)

      strictEqual(ns.ex(`measure/observation/${dateToId(date2)}`).equals(observation.term), true)
    })

    it('should use the given function to generate the date', async () => {
      const date = new Date('2020-01-01T00:00:00.000Z')
      const dataset = clownface({ dataset: rdf.dataset(), term: ns.ex.measure })
        .addOut(ns.ex.property, 'value')
        .dataset

      const transform = toObservation({
        date: () => {
          return rdf.literal(date.toISOString(), ns.xsd.dateTime)
        }
      })

      intoStream.object([dataset]).pipe(transform)

      const result = await getStream.array(transform)
      const observation = findObservation(result)

      strictEqual(ns.ex(`measure/observation/${dateToId(date)}`).equals(observation.term), true)
    })

    it('should use the current date if date is true', async () => {
      const dataset = clownface({ dataset: rdf.dataset(), term: ns.ex.measure })
        .addOut(ns.ex.property, 'value')
        .dataset

      const transform = toObservation({ date: true })

      intoStream.object([dataset]).pipe(transform)

      const result = await getStream.array(transform)
      const observation = findObservation(result)

      strictEqual(ns.ex(`measure/observation/${dateToId(new Date())}`).value.slice(0, -4), observation.value.slice(0, -4))
    })

    it('should use the current date if date has the string value true', async () => {
      const dataset = clownface({ dataset: rdf.dataset(), term: ns.ex.measure })
        .addOut(ns.ex.property, 'value')
        .dataset

      const transform = toObservation({ date: 'true' })

      intoStream.object([dataset]).pipe(transform)

      const result = await getStream.array(transform)
      const observation = findObservation(result)

      strictEqual(ns.ex(`measure/observation/${dateToId(new Date())}`).value.slice(0, -4), observation.value.slice(0, -4))
    })
  })

  describe('dateProperty', () => {
    it('should use the given dateProperty IRI string to add a date property', async () => {
      const date = new Date('2020-01-01T00:00:00.000Z')
      const dataset = clownface({ dataset: rdf.dataset(), term: ns.ex.measure })
        .addOut(ns.ex.property, 'value')
        .dataset

      const transform = toObservation({
        date: () => {
          return rdf.literal(date.toISOString(), ns.xsd.dateTime)
        },
        dateProperty: ns.ex.date.value
      })

      intoStream.object([dataset]).pipe(transform)

      const result = await getStream.array(transform)
      const observation = findObservation(result)
      const dateTerm = observation.out(ns.ex.date).term

      strictEqual(dateTerm.value, date.toISOString())
      strictEqual(dateTerm.datatype.equals(ns.xsd.dateTime), true)
    })

    it('should use the given dateProperty to add a date property', async () => {
      const date = new Date('2020-01-01T00:00:00.000Z')
      const dataset = clownface({ dataset: rdf.dataset(), term: ns.ex.measure })
        .addOut(ns.ex.property, 'value')
        .dataset

      const transform = toObservation({
        date: () => {
          return rdf.literal(date.toISOString(), ns.xsd.dateTime)
        },
        dateProperty: ns.ex.date
      })

      intoStream.object([dataset]).pipe(transform)

      const result = await getStream.array(transform)
      const observation = findObservation(result)
      const dateTerm = observation.out(ns.ex.date).term

      strictEqual(dateTerm.value, date.toISOString())
      strictEqual(dateTerm.datatype.equals(ns.xsd.dateTime), true)
    })
  })

  describe('observations', () => {
    it('should use the given observations IRI string as observation set', async () => {
      const dataset = clownface({ dataset: rdf.dataset(), term: ns.ex.measure })
        .addOut(ns.ex.property, 'value')
        .dataset

      const transform = toObservation({ observations: ns.ex.observation.value })

      intoStream.object([dataset]).pipe(transform)

      const result = await getStream.array(transform)
      const observation = findObservation(result)

      strictEqual(ns.ex.observation.equals(observation.in(ns.cube.observation).term), true)
    })

    it('should use the given observations observation set', async () => {
      const dataset = clownface({ dataset: rdf.dataset(), term: ns.ex.measure })
        .addOut(ns.ex.property, 'value')
        .dataset

      const transform = toObservation({ observations: ns.ex.observation })

      intoStream.object([dataset]).pipe(transform)

      const result = await getStream.array(transform)
      const observation = findObservation(result)

      strictEqual(ns.ex.observation.equals(observation.in(ns.cube.observation).term), true)
    })
  })

  describe('observation', () => {
    it('should use the given observation function to generate the observation term', async () => {
      const dataset = clownface({ dataset: rdf.dataset(), term: ns.ex.measure })
        .addOut(ns.ex.property, 'value')
        .dataset

      const transform = toObservation({
        observation: () => {
          return ns.ex('observation/123')
        }
      })

      intoStream.object([dataset]).pipe(transform)

      const result = await getStream.array(transform)
      const observation = findObservation(result)

      strictEqual(ns.ex('observation/123').equals(observation.term), true)
    })
  })

  describe('blacklist', () => {
    it('should delete properties given as Array of strings in the blacklist', async () => {
      const dataset = clownface({ dataset: rdf.dataset(), term: ns.ex.measure })
        .addOut(ns.ex.property1, 'value1')
        .addOut(ns.ex.property2, 'value2')
        .addOut(ns.ex.property3, 'value3')
        .dataset

      const transform = toObservation({ blacklist: [ns.ex.property1.value, ns.ex.property3.value] })

      intoStream.object([dataset]).pipe(transform)

      const result = await getStream.array(transform)
      const observation = findObservation(result)

      strictEqual(observation.out(ns.ex.property1).terms.length, 0)
      strictEqual(observation.out(ns.ex.property2).terms.length, 1)
      strictEqual(observation.out(ns.ex.property3).terms.length, 0)
    })

    it('should delete properties given as TermSet in the blacklist', async () => {
      const dataset = clownface({ dataset: rdf.dataset(), term: ns.ex.measure })
        .addOut(ns.ex.property1, 'value1')
        .addOut(ns.ex.property2, 'value2')
        .addOut(ns.ex.property3, 'value3')
        .dataset

      const transform = toObservation({ blacklist: new TermSet([ns.ex.property1, ns.ex.property3]) })

      intoStream.object([dataset]).pipe(transform)

      const result = await getStream.array(transform)
      const observation = findObservation(result)

      strictEqual(observation.out(ns.ex.property1).terms.length, 0)
      strictEqual(observation.out(ns.ex.property2).terms.length, 1)
      strictEqual(observation.out(ns.ex.property3).terms.length, 0)
    })
  })
})
