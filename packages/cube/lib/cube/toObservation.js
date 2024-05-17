import { URL } from 'node:url'
import { Transform } from 'readable-stream'
import { isLiteral, isNamedNode } from 'is-graph-pointer'
import dateToId from '../dateToId.js'
import urlJoin from '../urlJoin.js'

/**
 * @typedef {import('barnard59-env').Environment} Environment
 */

/**
 * @param {Environment} $rdf
 * @param {Object} options
 * @param {import('@rdfjs/types').DatasetCore} options.dataset
 * @returns {import('@rdfjs/types').NamedNode}
 */
function findRoot($rdf, { dataset }) {
  const subjects = [...dataset].filter(quad => quad.subject.termType === 'NamedNode').reduce((subjects, quad) => {
    const count = subjects.get(quad.subject) || 0

    subjects.set(quad.subject, count + 1)

    return subjects
  }, $rdf.termMap())

  /** @type {any} */
  const subject = [...subjects.entries()].sort((a, b) => a[1] - b[1])[0][0]

  return subject
}

/**
 * @this {{ rdf: Environment }}
 * @param {Object} options
 * @param {import('@rdfjs/types').DatasetCore} options.dataset
 * @param {import('@rdfjs/types').NamedNode} options.subject
 * @returns {import('@rdfjs/types').NamedNode}
 */
function defaultObserver({ dataset, subject }) {
  const observer = this.rdf.clownface({ dataset }).out(this.rdf.ns.cube.observedBy)

  if (isNamedNode(observer)) {
    return observer.term
  }

  const iri = new URL(subject.value)

  iri.pathname = '/'

  return this.rdf.namedNode(iri.toString())
}

/**
 * @this {{ rdf: Environment }}
 * @param {Object} options
 * @param {import('@rdfjs/types').NamedNode} options.subject
 * @returns {import('@rdfjs/types').NamedNode}
 */
function defaultObservations({ subject }) {
  const iri = urlJoin(subject.value, '..')

  if (iri.endsWith('/observation')) {
    return this.rdf.namedNode(`${iri}/`)
  }

  return this.rdf.namedNode(`${iri}/observation/`)
}

/**
 * @this {{ rdf: Environment }}
 * @param {Object} options
 * @param {import('@rdfjs/types').NamedNode} options.observations
 * @param {import('@rdfjs/types').NamedNode} options.subject
 */
function defaultObservation({ observations, subject }) {
  const url = new URL(subject.value)
  const id = url.pathname.split('/').slice(-1)[0]

  return this.rdf.namedNode(urlJoin(observations.value, id))
}

/**
 * @param {import('@rdfjs/types').NamedNode} property
 * @return DateCallback
 */
function dateByProperty(property) {
  /**
   * @this {{ rdf: Environment }}
   * @param {Object} options
   * @param {import('@rdfjs/types').DatasetCore} options.dataset
   * @returns {import('@rdfjs/types').Literal}
   */
  return function ({ dataset }) {
    const date = this.rdf.clownface({ dataset }).out(property)

    if (!isLiteral(date)) {
      throw new Error(`Expected a date literal at property ${property.value} but found ${date.term?.value}`)
    }

    return date.term
  }
}

/**
 * @this {{ rdf: Environment }}
 */
function dateNow() {
  return this.rdf.literal((new Date()).toISOString(), this.rdf.ns.xsd.dateTime)
}

/**
 * @this {{ rdf: Environment }}
 * @param {Object} options
 * @param {import('@rdfjs/types').DatasetCore} options.dataset
 */
function dateByDatatype({ dataset }) {
  /**
   *
   * @type {Array<import('@rdfjs/types').Literal>}
   */
  const terms = this.rdf.clownface({ dataset })
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

/**
 * @this {{ rdf: Environment }}
 * @param {Object} options
 * @param {import('@rdfjs/types').NamedNode} options.observations
 * @param {import('@rdfjs/types').DatasetCore} options.dataset
 * @param {DateCallback} [options.useDate]
 * @returns {import('@rdfjs/types').NamedNode}
 */
function dateObservation({ dataset, observations, useDate }) {
  if (!useDate) {
    throw new Error('useDate callback is required')
  }

  const date = useDate({ dataset })

  return this.rdf.namedNode(urlJoin(observations.value, dateToId(date.value)))
}

/**
 * @this {{ rdf: Environment }}
 * @param {Object} options
 * @param {import('@rdfjs/types').NamedNode} options.observations
 * @param {number} options.index
 */
function indexObservation({ index, observations }) {
  return this.rdf.namedNode(urlJoin(observations.value, `./${index.toString()}`))
}

/**
 * @param {Environment} $rdf
 * @param {import('@rdfjs/types').NamedNode | string} value
 * @returns {() => import('@rdfjs/types').NamedNode}
 */
function asTermObject($rdf, value) {
  const term = typeof value === 'string' ? $rdf.namedNode(value) : value

  return () => {
    return term
  }
}

/**
 * @typedef {(arg: Omit<Context, 'observation'>) => import('@rdfjs/types').NamedNode} ObservationCallback
 */

/**
 * @typedef {(arg: Omit<Context, 'observation' | 'observations'>) => import('@rdfjs/types').NamedNode} ObservationsCallback
 */

/**
 * @typedef {(arg: Omit<Context, 'observer' | 'observation' | 'observations'>) => import('@rdfjs/types').NamedNode | undefined | null} ObserverCallback
 */

/**
 * @typedef {(arg: { dataset: import('@rdfjs/types').DatasetCore }) => import('@rdfjs/types').Literal} DateCallback
 */

/**
 * @typedef {{
 *   index: number,
 *   blacklist: Set<import('@rdfjs/types').Term>,
 *   dimensions: Set<import('@rdfjs/types').NamedNode>
 *   observation: ObservationCallback
 *   observations: ObservationsCallback
 *   observer: ObserverCallback
 *   useDate?: DateCallback
 *   dateProperty?: import('@rdfjs/types').NamedNode
 * }} Options
 */

/**
 * @typedef {Omit<Options, 'observer' | 'observation' | 'observations'> & {
 *   dataset: import('@rdfjs/types').DatasetCore,
 *   subject: import('@rdfjs/types').NamedNode,
 *   observer?: import('@rdfjs/types').NamedNode | null,
 *   observations: import('@rdfjs/types').NamedNode,
 *   observation: import('@rdfjs/types').NamedNode,
 *   date?: import('@rdfjs/types').Literal,
 *   dateProperty?: import('@rdfjs/types').NamedNode,
 * }} Context
 */

class ToObservation extends Transform {
  /**
   * @param {Object} options
   * @param {Environment} options.rdf
   * @param {Array<string | import('clownface').GraphPointer<import('@rdfjs/types').NamedNode>>} [options.blacklist]
   * @param {Array<string | import('clownface').GraphPointer<import('@rdfjs/types').NamedNode>>} [options.dimensions]
   * @param {string | ObservationCallback} [options.observation]
   * @param {string | ObservationsCallback} [options.observations]
   * @param {string | ObserverCallback} [options.observer]
   * @param {boolean | 'true' | 'now' | string | import('@rdfjs/types').NamedNode | DateCallback} [options.useDate]
   * @param {import('@rdfjs/types').NamedNode} [options.dateProperty]
   * @param {boolean} [options.useIndex]
   */
  constructor({ rdf, dateProperty, ...options }) {
    super({ objectMode: true })

    /**
     * @private
     * @type {Environment}
     */
    this.rdf = rdf

    /** @type {Set<import('@rdfjs/types').NamedNode>} */
    const blacklist = this.rdf.termSet()
    if (options.blacklist) {
      for (const item of options.blacklist) {
        blacklist.add(typeof item === 'string' ? this.rdf.namedNode(item) : item.term)
      }
    }

    /** @type {Set<import('@rdfjs/types').NamedNode>} */
    const dimensions = this.rdf.termSet()
    if (options.dimensions) {
      for (const item of options.dimensions) {
        dimensions.add(typeof item === 'string' ? this.rdf.namedNode(item) : item.term)
      }
    }

    /** @type {ObserverCallback} */
    let observer = defaultObserver.bind({ rdf })
    if (options.observer) {
      if (typeof options.observer === 'function') {
        observer = options.observer
      } else if (options.observer) {
        observer = asTermObject(rdf, options.observer)
      }
    }

    /** @type {ObservationsCallback} */
    let observations = defaultObservations.bind({ rdf })
    if (options.observations) {
      if (typeof options.observations === 'function') {
        observations = options.observations
      } else if (options.observations) {
        observations = asTermObject(rdf, options.observations)
      }
    }

    /** @type {DateCallback | undefined} */
    let useDate
    if (options.useDate) {
      if (options.useDate === true || options.useDate === 'true') {
        useDate = dateByDatatype.bind({ rdf })
      } else if (options.useDate === 'now') {
        useDate = dateNow.bind({ rdf })
      } else if (typeof options.useDate === 'string') {
        useDate = dateByProperty(this.rdf.namedNode(options.useDate)).bind({ rdf })
      } else if (typeof options.useDate === 'object') {
        useDate = dateByProperty(options.useDate).bind({ rdf })
      } else if (typeof useDate === 'function') {
        useDate = options.useDate
      }
    }

    /** @type {ObservationCallback} */
    let observation = defaultObservation.bind({ rdf })
    if (options.observation && typeof options.observation === 'function') {
      observation = options.observation
    } else if (useDate) {
      observation = dateObservation.bind({ rdf })
    } else if (options.useIndex) {
      observation = indexObservation.bind({ rdf })
    }

    /**
     * @type {Options}
     */
    this.options = {
      index: 0,
      blacklist,
      dimensions,
      dateProperty,
      observer,
      observations,
      useDate,
      observation,
    }
  }

  /**
   * @param {import('@rdfjs/types').DatasetCore} chunk
   * @param {BufferEncoding} encoding
   * @param {(error?: Error | null, data?: any) => void} callback
   */
  _transform(chunk, encoding, callback) {
    try {
      /**
       * @type {any}
       */
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

      dataset.add(this.rdf.quad(context.observations, this.rdf.ns.cube.observation, context.observation))

      this.push([...dataset])

      this.options.index++

      callback()
    } catch (/** @type {any} */ err) {
      callback(err)
    }
  }
}

/**
 * @this {import('barnard59-core').Context}
 * @param {Object} options
 * @param {Array<string | import('clownface').GraphPointer<import('@rdfjs/types').NamedNode>>} [options.blacklist]
 * @param {Array<string | import('clownface').GraphPointer<import('@rdfjs/types').NamedNode>>} [options.dimensions]
 * @param {string} [options.observation]
 * @param {string} [options.observations]
 * @param {string} [options.observer]
 * @param {boolean} [options.useDate]
 * @param {import('@rdfjs/types').NamedNode} [options.dateProperty]
 * @param {boolean} [options.useIndex]
 * @returns {Transform}
 */
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
