import TermSet from '@rdfjs/term-set'

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
      this.pattern[name] = new TermSet([...value])
    } else {
      this.pattern[name] = new TermSet([value])
    }
  }
}

export default PatternMatcher
