import rdf from 'barnard59-env'
import { fromRdf } from 'rdf-literal'
import { DimensionConstraintsBuilder } from '../../../lib/cube/buildCubeShape/Constraints.js'
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

  it('should create a shape constrained to some named nodes', () => {
    const builder = new DimensionConstraintsBuilder({ rdf, datatypeParsers })
    const validator = buildShape(builder, [namedNode1, namedNode2])
    conforms(validator, [namedNode1, namedNode2])
    notConforms(validator, [namedNode3])
    notConforms(validator, [string1])
    notConforms(validator, [one])
  })
  it('should create a shape unconstrained', () => {
    const builder = new DimensionConstraintsBuilder({ rdf, datatypeParsers, inListMaxSize: 1 })
    const validator = buildShape(builder, [namedNode1, namedNode2])
    conforms(validator, [namedNode1, namedNode2, namedNode3, string1, one])
  })
  it('should create a shape constrained to some strings', () => {
    const builder = new DimensionConstraintsBuilder({ rdf, datatypeParsers })
    const validator = buildShape(builder, [string1, string2])
    conforms(validator, [string1, string2])
    notConforms(validator, [string3])
    notConforms(validator, [one])
    notConforms(validator, [namedNode1])
  })
  it('should create a shape constrained to all strings', () => {
    const builder = new DimensionConstraintsBuilder({ rdf, datatypeParsers, inListMaxSize: 1 })
    const validator = buildShape(builder, [string1, string2])
    conforms(validator, [string1, string2, string3])
    notConforms(validator, [one])
    notConforms(validator, [namedNode1])
  })
  it('should create a shape constrained to numbers in range', () => {
    const builder = new DimensionConstraintsBuilder({ rdf, datatypeParsers })
    const validator = buildShape(builder, [one, three])
    conforms(validator, [two])
    notConforms(validator, [string1])
    notConforms(validator, [namedNode1])
  })
  it('should create a shape constrained to (sh:or) alternatives', () => {
    const builder = new DimensionConstraintsBuilder({ rdf, datatypeParsers })
    const validator = buildShape(builder, [namedNode1, namedNode2, string1, string2, one, three])
    conforms(validator, [two])
    notConforms(validator, [string3])
    notConforms(validator, [namedNode3])
  })
})
