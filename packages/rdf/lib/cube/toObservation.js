const clownface = require('clownface')
const namespace = require('@rdfjs/namespace')
const TermSet = require('@rdfjs/term-set')
const rdf = require('rdf-ext')
const { Transform } = require('readable-stream')
const dateToId = require('../dateToId')
const urlJoin = require('../urlJoin')

const ns = {
  cube: namespace('http://ns.bergnet.org/cube/'),
  rdf: namespace('http://www.w3.org/1999/02/22-rdf-syntax-ns#'),
  xsd: namespace('http://www.w3.org/2001/XMLSchema#')
}

function defaultObserver ({ dataset }) {
  const observer = clownface({ dataset }).out(ns.cube.observedBy).term

  if (observer) {
    return observer
  }

  const quads = [...dataset.filter(quad => quad.subject.termType === 'NamedNode')]
  const subjects = new TermSet(quads.map(quad => quad.subject))

  if (subjects.size === 1) {
    return [...subjects][0]
  }

  return null
}

function dateByProperty (property) {
  return ({ dataset }) => {
    return clownface({ dataset }).out(property).term
  }
}

function dateNow () {
  return rdf.literal((new Date()).toISOString(), ns.xsd.dateTime)
}

function dateByDatatype ({ dataset }) {
  return clownface({ dataset }).out().filter(ptr => ns.xsd.dateTime.equals(ptr.term.datatype)).term
}

function defaultObservations ({ observer }) {
  return rdf.namedNode(urlJoin(observer.value, './observation'))
}

function defaultObservation ({ date, index, observations }) {
  const id = date ? dateToId(date.value) : `./${index.toString()}`

  return rdf.namedNode(urlJoin(observations.value, id))
}

function asTermObject (value) {
  if (typeof value === 'string') {
    value = rdf.namedNode(value)
  }

  return () => {
    return value
  }
}

class ToObservation extends Transform {
  constructor ({ observer, date, dateProperty, observations, observation, blacklist } = {}) {
    super({ objectMode: true })

    this.options = {
      index: 0,
      observer: defaultObserver,
      date: dateByDatatype,
      dateProperty: () => {},
      observations: defaultObservations,
      observation: defaultObservation,
      blacklist: new TermSet()
    }

    if (observer) {
      this.options.observer = asTermObject(observer)
    }

    if (typeof date === 'string') {
      if (date === 'true') {
        this.options.date = dateNow
      } else {
        this.options.date = dateByProperty(rdf.namedNode(date))
      }
    } else if (date && date.termType === 'NamedNode') {
      this.options.date = dateByProperty(date)
    } else if (typeof date === 'function') {
      this.options.date = date
    } else if (date === true) {
      this.options.date = dateNow
    }

    if (dateProperty) {
      this.options.dateProperty = asTermObject(dateProperty)
    }

    if (observations) {
      if (typeof observations === 'function') {
        this.options.observations = observations
      } else {
        this.options.observations = asTermObject(observations)
      }
    }

    if (observation) {
      this.options.observation = observation
    }

    if (blacklist) {
      for (const term of blacklist) {
        this.options.blacklist.add(typeof term === 'string' ? rdf.namedNode(term) : term)
      }
    }
  }

  _transform (chunk, encoding, callback) {
    const context = {
      dataset: rdf.dataset([...chunk]),
      index: this.options.index
    }

    context.observer = this.options.observer(context)
    context.date = this.options.date(context)
    context.dateProperty = this.options.dateProperty(context)
    context.observations = this.options.observations(context)
    context.observation = this.options.observation(context)

    const dataset = context.dataset
      .filter(quad => !quad.predicate.equals(ns.rdf.type))
      .filter(quad => !this.options.blacklist.has(quad.predicate))
      .map(quad => {
        return rdf.quad(
          quad.subject.termType === 'NamedNode' ? context.observation : quad.subject,
          quad.predicate,
          quad.object
        )
      })

    dataset.add(rdf.quad(context.observation, ns.rdf.type, ns.cube.Observation))

    if (context.date && context.dateProperty) {
      dataset.add(rdf.quad(context.observation, context.dateProperty, context.date))
    }

    if (context.observer) {
      dataset.add(rdf.quad(context.observation, ns.cube.observedBy, context.observer))
    }

    if (context.observations) {
      dataset.add(rdf.quad(context.observations, ns.cube.observation, context.observation))
    }

    this.push(dataset.toArray())

    this.options.index++

    callback()
  }
}

function toObservation ({ observer, date, dateProperty, observations, observation, blacklist } = {}) {
  return new ToObservation({ observer, date, dateProperty, observations, observation, blacklist })
}

module.exports = toObservation
