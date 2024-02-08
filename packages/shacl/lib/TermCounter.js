export default class TermCounter {
  /**
   * @param {import('@rdfjs/term-map/Factory.js').TermMapFactory} env
   */
  constructor(env) {
    this.termMap = env.termMap()
  }

  /**
   * @param {import('@rdfjs/types').Term} term
   */
  add(term) {
    this.termMap.set(term, (this.termMap.get(term) ?? 0) + 1)
  }
}
