import rdf from 'rdf-ext'

class PatternMatcher {
  constructor ({ subject, predicate, object, graph } = {}) {
    this.pattern = {}

    this.set('subject', subject)
    this.set('predicate', predicate)
    this.set('object', object)
    this.set('graph', graph)
  }

  test (quad) {
    return Object.entries(this.pattern).every(([name, values]) => values.has(quad[name]))
  }

  set (name, value) {
    if (!value) {
      return
    }

    if (value[Symbol.iterator]) {
      this.pattern[name] = rdf.termSet([...value])
    } else {
      this.pattern[name] = rdf.termSet([value])
    }
  }
}

export default PatternMatcher
