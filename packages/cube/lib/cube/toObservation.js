import { URL } from 'url'
import { Transform } from 'readable-stream'
import dateToId from '../dateToId.js'
import urlJoin from '../urlJoin.js'

function findRoot($rdf, { dataset }) {
  const subjects = [...dataset].filter(quad => quad.subject.termType === 'NamedNode').reduce((subjects, quad) => {
    const count = subjects.get(quad.subject) || 0

    subjects.set(quad.subject, count + 1)

    return subjects
  }, $rdf.termMap())

  const subject = [...subjects.entries()].sort((a, b) => a[1] - b[1])[0][0]

  return subject
}

function defaultObserver({ dataset, subject }) {
  const observer = this.rdf.clownface({ dataset }).out(this.rdf.ns.cube.observedBy).term

  if (observer) {
    return observer
  }

  const iri = new URL(subject.value)

  iri.pathname = '/'

  return this.rdf.namedNode(iri.toString())
}

function defaultObservations({ subject }) {
  const iri = urlJoin(subject.value, '..')

  if (iri.endsWith('/observation')) {
    return this.rdf.namedNode(`${iri}/`)
  }

  return this.rdf.namedNode(`${iri}/observation/`)
}

function defaultObservation({ observations, subject }) {
  const url = new URL(subject.value)
  const id = url.pathname.split('/').slice(-1)[0]

  return this.rdf.namedNode(urlJoin(observations.value, id))
}

function dateByProperty(property) {
  return function ({ dataset }) {
    return this.rdf.clownface({ dataset }).out(property).term
  }
}

function dateNow() {
  return this.rdf.literal((new Date()).toISOString(), this.rdf.ns.xsd.dateTime)
}

function dateByDatatype({ dataset }) {
  const terms = this.rdf.clownface({ dataset }).out().filter(ptr => this.rdf.ns.xsd.dateTime.equals(ptr.term.datatype)).terms

  if (terms.length === 0) {
    throw new Error('now date value found')
  }

  if (terms.length > 1) {
    throw new Error('multiple date values found')
  }

  return terms[0]
}

function dateObservation({ dataset, observations, useDate }) {
  const date = useDate({ dataset })

  return this.rdf.namedNode(urlJoin(observations.value, dateToId(date.value)))
}

function indexObservation({ index, observations }) {
  return this.rdf.namedNode(urlJoin(observations.value, `./${index.toString()}`))
}

function asTermObject($rdf, value) {
  if (typeof value === 'string') {
    value = $rdf.namedNode(value)
  }

  return () => {
    return value
  }
}

class ToObservation extends Transform {
  constructor({ rdf, blacklist, dimensions, observation, observations, observer, useDate, useIndex } = {}) {
    super({ objectMode: true })

    this.rdf = rdf
    this.options = {
      index: 0,
      blacklist: this.rdf.termSet(),
      dimensions: this.rdf.termSet(),
    }

    if (blacklist) {
      for (const item of blacklist) {
        this.options.blacklist.add(typeof item === 'string' ? this.rdf.namedNode(item) : item.term)
      }
    }

    if (dimensions) {
      for (const item of dimensions) {
        this.options.dimensions.add(typeof item === 'string' ? this.rdf.namedNode(item) : item.term)
      }
    }

    if (observer) {
      if (typeof observer === 'function') {
        this.options.observer = observer
      } else if (observer) {
        this.options.observer = asTermObject(rdf, observer)
      }
    } else {
      this.options.observer = defaultObserver.bind({ rdf })
    }

    if (observations) {
      if (typeof observations === 'function') {
        this.options.observations = observations
      } else if (observations) {
        this.options.observations = asTermObject(rdf, observations)
      }
    } else {
      this.options.observations = defaultObservations.bind({ rdf })
    }

    if (useDate) {
      if (useDate === true || useDate === 'true') {
        this.options.useDate = dateByDatatype.bind({ rdf })
      } else if (useDate === 'now') {
        this.options.useDate = dateNow.bind({ rdf })
      } else if (typeof useDate === 'string') {
        this.options.useDate = dateByProperty(this.rdf.namedNode(useDate)).bind({ rdf })
      } else if (useDate.termType) {
        this.options.useDate = dateByProperty(useDate).bind({ rdf })
      } else if (typeof useDate === 'function') {
        this.options.useDate = useDate
      }
    }

    if (observation && typeof observation === 'function') {
      this.options.observation = observation
    } else {
      if (this.options.useDate) {
        this.options.observation = dateObservation.bind({ rdf })
      } else if (useIndex) {
        this.options.observation = indexObservation.bind({ rdf })
      } else {
        this.options.observation = defaultObservation.bind({ rdf })
      }
    }
  }

  _transform(chunk, encoding, callback) {
    try {
      const context = {
        dataset: this.rdf.dataset([...chunk]),
        ...this.options,
      }

      context.subject = findRoot(this.rdf, context)
      context.observer = this.options.observer(context)
      context.observations = this.options.observations(context)
      context.observation = this.options.observation(context)

      const dataset = this.rdf.dataset([...context.dataset]
        .filter(quad => !quad.predicate.equals(this.rdf.ns.rdf.type))
        .filter(quad => !this.options.blacklist.has(quad.predicate))
        .map(quad => {
          return this.rdf.quad(
            quad.subject.termType === 'NamedNode' ? context.observation : quad.subject,
            quad.predicate,
            quad.object,
          )
        }))

      dataset.add(this.rdf.quad(context.observation, this.rdf.ns.rdf.type, this.rdf.ns.cube.Observation))

      if (context.date && context.dateProperty) {
        dataset.add(this.rdf.quad(context.observation, context.dateProperty, context.date))
      }

      if (context.observer) {
        dataset.add(this.rdf.quad(context.observation, this.rdf.ns.cube.observedBy, context.observer))
      }

      if (this.options.dimensions) {
        for (const term of this.options.dimensions) {
          if (dataset.match(context.observation, term).size === 0) {
            dataset.add(this.rdf.quad(context.observation, term, this.rdf.literal('NaN', this.rdf.ns.xsd.double)))
          }
        }
      }

      if (context.observations) {
        dataset.add(this.rdf.quad(context.observations, this.rdf.ns.cube.observation, context.observation))
      }

      this.push([...dataset])

      this.options.index++

      callback()
    } catch (err) {
      callback(err)
    }
  }
}

function toObservation({
  blacklist,
  dimensions,
  observation,
  observations,
  observer,
  useDate,
  dateProperty,
  useIndex,
} = {}) {
  return new ToObservation({ rdf: this.env, blacklist, dimensions, observation, observations, observer, useDate, dateProperty, useIndex })
}

export default toObservation
