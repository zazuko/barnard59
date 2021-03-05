const { URL } = require('url')
const clownface = require('clownface')
const namespace = require('@rdfjs/namespace')
const TermMap = require('@rdfjs/term-map')
const TermSet = require('@rdfjs/term-set')
const rdf = require('rdf-ext')
const { Transform } = require('readable-stream')
const dateToId = require('../dateToId')
const urlJoin = require('../urlJoin')

const ns = {
  cube: namespace('https://cube.link/'),
  rdf: namespace('http://www.w3.org/1999/02/22-rdf-syntax-ns#'),
  xsd: namespace('http://www.w3.org/2001/XMLSchema#')
}

function findRoot ({ dataset }) {
  const subjects = [...dataset.filter(quad => quad.subject.termType === 'NamedNode')].reduce((subjects, quad) => {
    const count = subjects.get(quad.subject) || 0

    subjects.set(quad.subject, count + 1)

    return subjects
  }, new TermMap())

  const subject = [...subjects.entries()].sort((a, b) => a[1] - b[1])[0][0]

  return subject
}

function defaultObserver ({ dataset, subject }) {
  const observer = clownface({ dataset }).out(ns.cube.observedBy).term

  if (observer) {
    return observer
  }

  const iri = new URL(subject.value)

  iri.pathname = '/'

  return rdf.namedNode(iri.toString())
}

function defaultObservations ({ subject }) {
  const iri = urlJoin(subject.value, '..')

  if (iri.endsWith('/observation')) {
    return rdf.namedNode(`${iri}/`)
  }

  return rdf.namedNode(`${iri}/observation/`)
}

function defaultObservation ({ observations, subject }) {
  const url = new URL(subject.value)
  const id = url.pathname.split('/').slice(-1)[0]

  return rdf.namedNode(urlJoin(observations.value, id))
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
  const terms = clownface({ dataset }).out().filter(ptr => ns.xsd.dateTime.equals(ptr.term.datatype)).terms

  if (terms.length === 0) {
    throw new Error('now date value found')
  }

  if (terms.length > 1) {
    throw new Error('multiple date values found')
  }

  return terms[0]
}

function dateObservation ({ dataset, observations, useDate }) {
  const date = useDate({ dataset })

  return rdf.namedNode(urlJoin(observations.value, dateToId(date.value)))
}

function indexObservation ({ index, observations }) {
  return rdf.namedNode(urlJoin(observations.value, `./${index.toString()}`))
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
  constructor ({ blacklist, dimensions, observation, observations, observer, useDate, useIndex } = {}) {
    super({ objectMode: true })

    this.options = {
      index: 0,
      blacklist: new TermSet(),
      dimensions: new TermSet()
    }

    if (blacklist) {
      for (const item of blacklist) {
        this.options.blacklist.add(typeof item === 'string' ? rdf.namedNode(item) : item.term)
      }
    }

    if (dimensions) {
      for (const item of dimensions) {
        this.options.dimensions.add(typeof item === 'string' ? rdf.namedNode(item) : item.term)
      }
    }

    if (observer) {
      if (typeof observer === 'function') {
        this.options.observer = observer
      } else if (observer) {
        this.options.observer = asTermObject(observer)
      }
    } else {
      this.options.observer = defaultObserver
    }

    if (observations) {
      if (typeof observations === 'function') {
        this.options.observations = observations
      } else if (observations) {
        this.options.observations = asTermObject(observations)
      }
    } else {
      this.options.observations = defaultObservations
    }

    if (useDate) {
      if (useDate === true || useDate === 'true') {
        this.options.useDate = dateByDatatype
      } else if (useDate === 'now') {
        this.options.useDate = dateNow
      } else if (typeof useDate === 'string') {
        this.options.useDate = dateByProperty(rdf.namedNode(useDate))
      } else if (useDate.termType) {
        this.options.useDate = dateByProperty(useDate)
      } else if (typeof useDate === 'function') {
        this.options.useDate = useDate
      }
    }

    if (observation && typeof observation === 'function') {
      this.options.observation = observation
    } else {
      if (this.options.useDate) {
        this.options.observation = dateObservation
      } else if (useIndex) {
        this.options.observation = indexObservation
      } else {
        this.options.observation = defaultObservation
      }
    }
  }

  _transform (chunk, encoding, callback) {
    try {
      const context = {
        dataset: rdf.dataset([...chunk]),
        ...this.options
      }

      context.subject = findRoot(context)
      context.observer = this.options.observer(context)
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

      if (this.options.dimensions) {
        for (const term of this.options.dimensions) {
          if (dataset.match(context.observation, term).size === 0) {
            dataset.add(rdf.quad(context.observation, term, rdf.literal('NaN', ns.xsd.double)))
          }
        }
      }

      if (context.observations) {
        dataset.add(rdf.quad(context.observations, ns.cube.observation, context.observation))
      }

      this.push(dataset.toArray())

      this.options.index++

      callback()
    } catch (err) {
      callback(err)
    }
  }
}

function toObservation ({
  blacklist,
  dimensions,
  observation,
  observations,
  observer,
  useDate,
  dateProperty,
  useIndex
} = {}) {
  return new ToObservation({ blacklist, dimensions, observation, observations, observer, useDate, dateProperty, useIndex })
}

module.exports = toObservation
