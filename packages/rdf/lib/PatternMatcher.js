import rdf from 'barnard59-env'

/**
 * @typedef {'subject' | 'predicate' | 'object' | 'graph'} QuadPart
 * @typedef {import('@rdfjs/term-set').default} TermSet
 */

class PatternMatcher {
  /**
   * @param {object} [options]
   * @param {import('@rdfjs/types').Quad_Subject | Iterable<import('@rdfjs/types').Term>} [options.subject]
   * @param {import('@rdfjs/types').Quad_Predicate | Iterable<import('@rdfjs/types').Term>} [options.predicate]
   * @param {import('@rdfjs/types').Quad_Object | Iterable<import('@rdfjs/types').Term>} [options.object]
   * @param {import('@rdfjs/types').Quad_Graph | Iterable<import('@rdfjs/types').Term>} [options.graph]
   */
  constructor({ subject, predicate, object, graph } = {}) {
    /**
     * @type {Partial<Record<QuadPart, TermSet>>}
     */
    this.pattern = {}

    this.set('subject', subject)
    this.set('predicate', predicate)
    this.set('object', object)
    this.set('graph', graph)
  }

  /**
   * @param {import('@rdfjs/types').Quad} quad
   * @returns {boolean}
   */
  test(quad) {
    // @ts-expect-error
    return Object.entries(this.pattern).every(([name, values]) => values.has(quad[name]))
  }

  /**
   * @param {QuadPart} name
   * @param {import('@rdfjs/types').Term | Iterable<import('@rdfjs/types').Term> | undefined} value
   */
  set(name, value) {
    if (!value) {
      return
    }

    if (Symbol.iterator in value) {
      this.pattern[name] = rdf.termSet([...value])
    } else {
      this.pattern[name] = rdf.termSet([value])
    }
  }
}

export default PatternMatcher
