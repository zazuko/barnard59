import rdf from 'barnard59-env'
import { fromRdf } from 'rdf-literal'
import { DimensionConstraintsBuilder } from '../../../lib/cube/buildCubeShape/constraintBuilder/DimensionConstraintsBuilder.js'
import { buildShape, conforms, notConforms } from './support.js'

const { xsd } = rdf.ns

const datatypeParsers = rdf.termMap([
  [xsd.integer, fromRdf],
])

describe('DimensionConstraintsBuilder', () => {
  const namedNode1 = rdf.namedNode('http://example.org/namedNode1')
  const namedNode2 = rdf.namedNode('http://example.org/namedNode2')
  const namedNode3 = rdf.namedNode('http://example.org/namedNode3')
  const string1 = rdf.literal('foo', xsd.string)
  const string2 = rdf.literal('bar', xsd.string)
  const string3 = rdf.literal('baz', xsd.string)
  const one = rdf.literal('1', xsd.integer)
  const two = rdf.literal('2', xsd.integer)
  const three = rdf.literal('3', xsd.integer)
  const four = rdf.literal('4', xsd.integer)

  context('built from two named nodes', () => {
    const builder = new DimensionConstraintsBuilder({ rdf, datatypeParsers })
    const validator = buildShape(builder, namedNode1, namedNode2)
    const assertConforms = conforms.bind(null, validator)
    const assertNotConforms = notConforms.bind(null, validator)

    it('the two named nodes conform', () => assertConforms(namedNode1, namedNode2))
    it('another named node does not conform', () => assertNotConforms(namedNode3))
    it('a string literal does not conform', () => assertNotConforms(string1))
    it('an integer literal does not conform', () => assertNotConforms(one))
  })
  context('built from too many distinct named nodes', () => {
    const builder = new DimensionConstraintsBuilder({ rdf, datatypeParsers, inListMaxSize: 1 })
    const validator = buildShape(builder, namedNode1, namedNode2)
    const assertConforms = conforms.bind(null, validator)
    const assertNotConforms = notConforms.bind(null, validator)
    it.only('all named nodes conform', () => assertConforms(namedNode1, namedNode2, namedNode3))
    it('a string literal does not conform', () => assertNotConforms(string1))
    it('an integer literal does not conform', () => assertNotConforms(one))
  })
  context('built from two strings', () => {
    const builder = new DimensionConstraintsBuilder({ rdf, datatypeParsers })
    const validator = buildShape(builder, string1, string2)
    const assertConforms = conforms.bind(null, validator)
    const assertNotConforms = notConforms.bind(null, validator)

    it('the two strings conform', () => assertConforms(string1, string2))
    it('another string does not conform', () => assertNotConforms(string3))
    it('a named node does not conform', () => assertNotConforms(namedNode1))
    it('an integer literal does not conform', () => assertNotConforms(one))
  })
  context('built from too many distinct strings', () => {
    const builder = new DimensionConstraintsBuilder({ rdf, datatypeParsers, inListMaxSize: 1 })
    const validator = buildShape(builder, string1, string2)
    const assertConforms = conforms.bind(null, validator)
    const assertNotConforms = notConforms.bind(null, validator)
    it('every string conforms', () => assertConforms(string1, string2, string3))
    it('an integer literal does not conform', () => assertNotConforms(one))
    it('a named node does not conform', () => assertNotConforms(namedNode1))
  })
  context('built from two integers', () => {
    const builder = new DimensionConstraintsBuilder({ rdf, datatypeParsers })
    const validator = buildShape(builder, one, three)
    const assertConforms = conforms.bind(null, validator)
    const assertNotConforms = notConforms.bind(null, validator)

    it('the two integers conform', () => assertConforms(one, three))
    it('an integer in between conforms', () => assertConforms(two))
    it('an integer outside the range does not conform', () => assertNotConforms(four))
    it('a string literal does not conform', () => assertNotConforms(string1))
    it('a named node does not conform', () => assertNotConforms(namedNode1))
  })
  context('built two named nodes, two strings and two integers', () => {
    const builder = new DimensionConstraintsBuilder({ rdf, datatypeParsers })
    const validator = buildShape(builder, namedNode1, namedNode2, string1, string2, one, three)
    const assertConforms = conforms.bind(null, validator)
    const assertNotConforms = notConforms.bind(null, validator)

    it('the two named nodes conform', () => assertConforms(namedNode1, namedNode2))
    it('another named node does not conform', () => assertNotConforms(namedNode3))
    it('the two strings conform', () => assertConforms(string1, string2))
    it('another string does not conform', () => assertNotConforms(string3))
    it('the two integers conform', () => assertConforms(one, three))
    it('an integer in between conforms', () => assertConforms(two))
    it('an integer outside the range does not conform', () => assertNotConforms(four))
  })
})
