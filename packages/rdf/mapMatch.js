import { Transform } from 'readable-stream'
import PatternMatcher from './lib/PatternMatcher.js'

/**
 * @typedef {(this: { rdf: import('barnard59-env').Environment }, quad: import('@rdfjs/types').Quad) => Promise<T> | T} MapCallback
 * @template T
 */

/**
 * @this {import('barnard59-core').Context}
 * @param {object} options
 * @param {MapCallback<T>} options.map
 * @param {import('@rdfjs/types').Quad_Subject | Iterable<import('@rdfjs/types').Term>} [options.subject]
 * @param {import('@rdfjs/types').Quad_Predicate | Iterable<import('@rdfjs/types').Term>} [options.predicate]
 * @param {import('@rdfjs/types').Quad_Object | Iterable<import('@rdfjs/types').Term>} [options.object]
 * @param {import('@rdfjs/types').Quad_Graph | Iterable<import('@rdfjs/types').Term>} [options.graph]
 * @return {Transform}
 * @template T
 */
function mapMatch({ map, subject, predicate, object, graph }) {
  const matcher = new PatternMatcher({ subject, predicate, object, graph })

  return new Transform({
    objectMode: true,
    /**
     * @param {import('@rdfjs/types').Quad} quad
     * @param {string} encoding
     * @param {(error?: Error | null, data?: unknown) => void} callback
     * @return {Promise<void>}
     */
    transform: async (quad, encoding, callback) => {
      // these are not the quads you're looking for
      if (!matcher.test(quad)) {
        return callback(null, quad)
      }

      try {
        callback(null, await map.call({ rdf: this.env }, quad))
      } catch (/** @type {any} */ err) {
        callback(err)
      }
    },
  })
}

export default mapMatch
