import { URL } from 'node:url'
import type { NamedNode, Literal, DatasetCore, Term } from '@rdfjs/types'
import { Transform } from 'readable-stream'
import { isLiteral, isNamedNode } from 'is-graph-pointer'
import type { Environment } from 'barnard59-env'
import type { Context as BarnardContext } from 'barnard59-core'
import type { GraphPointer } from 'clownface'
import dateToId from '../dateToId.js'
import urlJoin from '../urlJoin.js'

function findRoot($rdf: Environment, { dataset }: { dataset: DatasetCore }): NamedNode {
  const subjects = [...dataset].filter(quad => quad.subject.termType === 'NamedNode').reduce((subjects, quad) => {
    const count = subjects.get(quad.subject) || 0

    subjects.set(quad.subject, count + 1)

    return subjects
  }, $rdf.termMap())

  const subject = [...subjects.entries()].sort((a, b) => a[1] - b[1])[0][0]

  return subject as unknown as NamedNode
}

function defaultObserver(this: { rdf: Environment }, { dataset, subject }: { dataset: DatasetCore; subject: NamedNode }): NamedNode {
  const observer = this.rdf.clownface({ dataset }).out(this.rdf.ns.cube.observedBy)

  if (isNamedNode(observer)) {
    return observer.term
  }

  const iri = new URL(subject.value)

  iri.pathname = '/'

  return this.rdf.namedNode(iri.toString())
}

function defaultObservations(this: { rdf: Environment }, { subject }: { subject: NamedNode }): NamedNode {
  const iri = urlJoin(subject.value, '..')

  if (iri.endsWith('/observation')) {
    return this.rdf.namedNode(`${iri}/`)
  }

  return this.rdf.namedNode(`${iri}/observation/`)
}

function defaultObservation(this: { rdf: Environment }, { observations, subject }: { observations: NamedNode; subject: NamedNode }) {
  const url = new URL(subject.value)
  const id = url.pathname.split('/').slice(-1)[0]

  return this.rdf.namedNode(urlJoin(observations.value, id))
}

interface DateCallback {
  (arg: { dataset: DatasetCore }): Literal
}

function dateByProperty(property: NamedNode): DateCallback {
  return function (this:{ rdf: Environment }, { dataset }: { dataset: DatasetCore }): Literal {
    const date = this.rdf.clownface({ dataset }).out(property)

    if (!isLiteral(date)) {
      throw new Error(`Expected a date literal at property ${property.value} but found ${date.term?.value}`)
    }

    return date.term
  }
}

function dateNow(this: { rdf: Environment }) {
  return this.rdf.literal((new Date()).toISOString(), this.rdf.ns.xsd.dateTime)
}

function dateByDatatype(this: { rdf: Environment }, { dataset }: { dataset: DatasetCore }) {
  const terms: Literal[] = this.rdf.clownface({ dataset })
    .out()
    .filter(isLiteral)
    .filter(ptr => this.rdf.ns.xsd.dateTime.equals(ptr.term.datatype))
    .terms

  if (terms.length === 0) {
    throw new Error('now date value found')
  }

  if (terms.length > 1) {
    throw new Error('multiple date values found')
  }

  return terms[0]
}

function dateObservation(this: { rdf: Environment }, { dataset, observations, useDate }: { dataset: DatasetCore; observations: NamedNode; useDate?: DateCallback }): NamedNode {
  if (!useDate) {
    throw new Error('useDate callback is required')
  }

  const date = useDate({ dataset })

  return this.rdf.namedNode(urlJoin(observations.value, dateToId(date.value)))
}

function indexObservation(this: { rdf: Environment }, { index, observations }: { index: number; observations: NamedNode }) {
  return this.rdf.namedNode(urlJoin(observations.value, `./${index.toString()}`))
}

function asTermObject($rdf: Environment, value: NamedNode | string): () => NamedNode {
  const term = typeof value === 'string' ? $rdf.namedNode(value) : value

  return () => {
    return term
  }
}

interface Context {
  index: number
  dataset: DatasetCore
  subject: NamedNode
  observer?: NamedNode | null
  observations: NamedNode
  observation: NamedNode
  date?: Literal
  dateProperty?: NamedNode
}

interface ObservationsCallback {
  (arg: Omit<Context, 'observation'>): NamedNode
}

interface ObservationCallback {
  (arg: Omit<Context, 'observation'>): NamedNode
}

interface ObserverCallback {
  (arg: Omit<Context, 'observer' | 'observation' | 'observations'>): NamedNode | undefined | null
}

interface Options {
  blacklist?: Array<GraphPointer<NamedNode>> | string[]
  dimensions?: Array<GraphPointer<NamedNode>> | string[]
  observation?: ObservationCallback
  observations?: ObservationsCallback
  observer?: ObserverCallback
  useDate?: boolean | 'now' | 'true' | string | DateCallback | GraphPointer<NamedNode>
  dateProperty?: NamedNode
  useIndex?: boolean
}

class ToObservation extends Transform {
  declare rdf: Environment
  declare options: {
    index: number
    blacklist: Set<Term>
    dimensions: Set<NamedNode>
    observation: ObservationCallback
    observations: ObservationsCallback
    observer: ObserverCallback
    useDate?: DateCallback
    dateProperty?: NamedNode
  }

  constructor({ rdf, blacklist, dimensions, observation, observations, observer, useDate, useIndex }: Options & { rdf: Environment }) {
    super({ objectMode: true })

    this.rdf = rdf
    this.options = {
      index: 0,
      blacklist: this.rdf.termSet(),
      dimensions: this.rdf.termSet(),
    } as unknown as typeof this.options

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
      } else if ('term' in useDate) {
        this.options.useDate = dateByProperty(useDate.term).bind({ rdf })
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

  _transform(chunk: DatasetCore, encoding: BufferEncoding, callback: (error?: Error | null, data?: unknown) => void) {
    try {
      const context = {
        dataset: this.rdf.dataset([...chunk]),
        ...this.options,
      } as unknown as Context

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

      dataset.add(this.rdf.quad(context.observations, this.rdf.ns.cube.observation, context.observation))

      this.push([...dataset])

      this.options.index++

      callback()
    } catch (err: any) { // eslint-disable-line @typescript-eslint/no-explicit-any
      callback(err)
    }
  }
}

function toObservation(this: BarnardContext, {
  blacklist,
  dimensions,
  observation,
  observations,
  observer,
  useDate,
  dateProperty,
  useIndex,
}: {
  blacklist?: string[] | GraphPointer<NamedNode>[]
  dimensions?: string[] | GraphPointer<NamedNode>[]
  observation?: ObservationCallback
  observations?: ObservationsCallback
  observer?: ObserverCallback
  useDate?: boolean | 'now' | 'true' | string | DateCallback | GraphPointer<NamedNode>
  dateProperty?: NamedNode
  useIndex?: boolean
} = {}) {
  return new ToObservation({ rdf: this.env, blacklist, dimensions, observation, observations, observer, useDate, dateProperty, useIndex })
}

export default toObservation
