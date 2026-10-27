import { notStrictEqual, strictEqual, throws } from 'node:assert'
import rdf from 'barnard59-env'
import cloneTermUnbound from '../lib/cloneTerm.js'
import ns from './support/namespaces.js'

const cloneTerm = cloneTermUnbound.bind(null, rdf)

describe('cloneTerm', function () {
  it('should be a function', function () {
    strictEqual(typeof cloneTerm, 'function')
  })

  it('should return null if the given argument is null', function () {
    const result = cloneTerm(null)

    strictEqual(result, null)
  })

  it('should return a blank node with the same blank node id as the given blank node', function () {
    const blankNode = rdf.blankNode()

    const result = cloneTerm(blankNode)

    notStrictEqual(result, blankNode)
    strictEqual(blankNode.equals(result), true)
  })

  it('should return a literal with the same value as the given literal', function () {
    const literal = rdf.literal('test')

    const result = cloneTerm(literal)

    notStrictEqual(result, literal)
    strictEqual(literal.equals(result), true)
  })

  it('should return a literal with the same datatype as the given literal', function () {
    const literal = rdf.literal('test', ns.ex.datatype)

    const result = cloneTerm(literal)

    notStrictEqual(result, literal)
    strictEqual(literal.equals(result), true)
  })

  it('should return a literal with the same language as the given literal', function () {
    const literal = rdf.literal('test', 'de')

    const result = cloneTerm(literal)

    notStrictEqual(result, literal)
    strictEqual(literal.equals(result), true)
  })

  it('should return a named node the same value as the given named node', function () {
    const namedNode = ns.ex.subject

    const result = cloneTerm(namedNode)

    notStrictEqual(result, namedNode)
    strictEqual(namedNode.equals(result), true)
  })

  it('should throw an error if the term type is unknown', function () {
    throws(() => {
      cloneTerm({})
    })
  })
})
