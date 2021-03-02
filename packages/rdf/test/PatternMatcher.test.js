import { strictEqual } from 'assert'
import { describe, it } from 'mocha'
import rdf from 'rdf-ext'
import { ex } from './support/namespaces.js'
import PatternMatcher from '../lib/PatternMatcher.js'

describe('PatternMatcher', () => {
  it('should be a constructor', () => {
    strictEqual(typeof PatternMatcher, 'function')
  })

  it('should assign the given terms to the pattern object', () => {
    const subject = ex.subject
    const predicate = ex.predicate
    const object = ex.object
    const graph = ex.graph

    const matcher = new PatternMatcher({ subject, predicate, object, graph })

    strictEqual(matcher.pattern.subject.has(subject), true)
    strictEqual(matcher.pattern.predicate.has(predicate), true)
    strictEqual(matcher.pattern.object.has(object), true)
    strictEqual(matcher.pattern.graph.has(graph), true)
  })

  it('should assign the given iterable to the pattern object', () => {
    const subject1 = ex.subject1
    const subject2 = ex.subject2
    const predicate1 = ex.predicate1
    const predicate2 = ex.predicate2
    const object1 = ex.object1
    const object2 = ex.object2
    const graph1 = ex.graph1
    const graph2 = ex.graph2

    const matcher = new PatternMatcher({
      subject: [subject1, subject2],
      predicate: [predicate1, predicate2],
      object: [object1, object2],
      graph: [graph1, graph2]
    })

    strictEqual(matcher.pattern.subject.has(subject1), true)
    strictEqual(matcher.pattern.subject.has(subject2), true)
    strictEqual(matcher.pattern.predicate.has(predicate1), true)
    strictEqual(matcher.pattern.predicate.has(predicate2), true)
    strictEqual(matcher.pattern.object.has(object1), true)
    strictEqual(matcher.pattern.object.has(object2), true)
    strictEqual(matcher.pattern.graph.has(graph1), true)
    strictEqual(matcher.pattern.graph.has(graph2), true)
  })

  describe('.test', () => {
    it('should be a method', () => {
      const matcher = new PatternMatcher()

      strictEqual(typeof matcher.test, 'function')
    })

    it('should return false if the quad doesn\'t match the pattern', () => {
      const subject = ex.subject
      const predicate = ex.predicate
      const object = ex.object
      const graph = ex.graph

      const matcher = new PatternMatcher({ subject, predicate, object, graph })

      const result = matcher.test(rdf.quad(subject, predicate, object, ex.graph1))

      strictEqual(result, false)
    })

    it('should return true if the subject matches', () => {
      const subject = ex.subject
      const predicate = ex.predicate
      const object = ex.object
      const graph = ex.graph

      const matcher = new PatternMatcher({ subject })

      const result = matcher.test(rdf.quad(subject, predicate, object, graph))

      strictEqual(result, true)
    })

    it('should return true if the predicate matches', () => {
      const subject = ex.subject
      const predicate = ex.predicate
      const object = ex.object
      const graph = ex.graph

      const matcher = new PatternMatcher({ predicate })

      const result = matcher.test(rdf.quad(subject, predicate, object, graph))

      strictEqual(result, true)
    })

    it('should return true if the object matches', () => {
      const subject = ex.subject
      const predicate = ex.predicate
      const object = ex.object
      const graph = ex.graph

      const matcher = new PatternMatcher({ object })

      const result = matcher.test(rdf.quad(subject, predicate, object, graph))

      strictEqual(result, true)
    })

    it('should return true if the graph matches', () => {
      const subject = ex.subject
      const predicate = ex.predicate
      const object = ex.object
      const graph = ex.graph

      const matcher = new PatternMatcher({ graph })

      const result = matcher.test(rdf.quad(subject, predicate, object, graph))

      strictEqual(result, true)
    })
  })
})
