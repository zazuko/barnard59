import rdf from 'barnard59-env'
import { fromRdf } from 'rdf-literal'
import { DimensionConstraintsBuilder } from '../../../lib/cube/buildCubeShape/constraintBuilder/DimensionConstraintsBuilder.js'
import { prepareValidator } from './support.js'

const { xsd, cube } = rdf.ns

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
  const cubeUndefined = rdf.literal('', cube.Undefined)

  context('built from two named nodes', () => {
    before(prepareValidator(new DimensionConstraintsBuilder({ rdf, datatypeParsers }), namedNode1, namedNode2))

    it('the two named nodes conform', function () { this.assertConforms(namedNode1, namedNode2) })
    it('another named node does not conform', function () { this.assertNotConforms(namedNode3) })
    it('a string literal does not conform', function () { this.assertNotConforms(string1) })
    it('an integer literal does not conform', function () { this.assertNotConforms(one) })
  })

  context('built from too many distinct named nodes', () => {
    before(prepareValidator(new DimensionConstraintsBuilder({ rdf, datatypeParsers, inListMaxSize: 1 }), namedNode1, namedNode2))

    it('all named nodes conform', function () { this.assertConforms(namedNode1, namedNode2, namedNode3) })
    it('a string literal does not conform', function () { this.assertNotConforms(string1) })
    it('an integer literal does not conform', function () { this.assertNotConforms(one) })
  })

  context('built from two strings', () => {
    before(prepareValidator(new DimensionConstraintsBuilder({ rdf, datatypeParsers }), string1, string2))

    it('the two strings conform', function () { this.assertConforms(string1, string2) })
    it('another string does not conform', function () { this.assertNotConforms(string3) })
    it('a named node does not conform', function () { this.assertNotConforms(namedNode1) })
    it('an integer literal does not conform', function () { this.assertNotConforms(one) })
  })

  context('built from too many distinct strings', () => {
    before(prepareValidator(new DimensionConstraintsBuilder({ rdf, datatypeParsers, inListMaxSize: 1 }), string1, string2))

    it('every string conforms', function () { this.assertConforms(string1, string2, string3) })
    it('an integer literal does not conform', function () { this.assertNotConforms(one) })
    it('a named node does not conform', function () { this.assertNotConforms(namedNode1) })
  })

  context('built from two integers', () => {
    before(prepareValidator(new DimensionConstraintsBuilder({ rdf, datatypeParsers }), one, three))

    it('the two integers conform', function () { this.assertConforms(one, three) })
    it('an integer in between conforms', function () { this.assertConforms(two) })
    it('an integer outside the range does not conform', function () { this.assertNotConforms(four) })
    it('a string literal does not conform', function () { this.assertNotConforms(string1) })
    it('a named node does not conform', function () { this.assertNotConforms(namedNode1) })
  })

  context('built from two named nodes, two strings and two integers', () => {
    before(prepareValidator(new DimensionConstraintsBuilder({ rdf, datatypeParsers }), namedNode1, namedNode2, string1, string2, one, three))

    it('the two named nodes conform', function () { this.assertConforms(namedNode1, namedNode2) })
    it('another named node does not conform', function () { this.assertNotConforms(namedNode3) })
    it('the two strings conform', function () { this.assertConforms(string1, string2) })
    it('another string does not conform', function () { this.assertNotConforms(string3) })
    it('the two integers conform', function () { this.assertConforms(one, three) })
    it('an integer in between conforms', function () { this.assertConforms(two) })
    it('an integer outside the range does not conform', function () { this.assertNotConforms(four) })
  })

  context('built from a string and a cube:Undefined', () => {
    before(prepareValidator(new DimensionConstraintsBuilder({ rdf, datatypeParsers }), string1, cubeUndefined))

    it('the two values conform', function () { this.assertConforms(string1, cubeUndefined) })
    it('another string does not conform', function () { this.assertNotConforms(string2) })
  })

  context('built from a string and a named node', () => {
    before(prepareValidator(new DimensionConstraintsBuilder({ rdf, datatypeParsers }), string1, namedNode1))

    it('the two values conform', function () { this.assertConforms(string1, namedNode1) })
    it('another string does not conform', function () { this.assertNotConforms(string2) })
    it('another named node does not conform', function () { this.assertNotConforms(namedNode2) })
  })
})
