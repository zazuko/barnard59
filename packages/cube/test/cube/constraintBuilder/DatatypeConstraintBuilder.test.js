import rdf from 'barnard59-env'
import { DatatypeConstraintBuilder } from '../../../lib/cube/buildCubeShape/Constraints.js'
import { buildShape, conforms, notConforms } from './support.js'

const { xsd } = rdf.ns

describe('DatatypeConstraintBuilder', () => {
  const string1 = rdf.literal('foo', xsd.string)
  const string2 = rdf.literal('bar', xsd.string)
  const string3 = rdf.literal('baz', xsd.string)
  const integer = rdf.literal('2', xsd.integer)
  const namedNode = rdf.namedNode('http://example.org/namedNode')

  it('should create a constrained shape', () => {
    const builder = new DatatypeConstraintBuilder(rdf, xsd.string)
    const validator = buildShape(builder, [string1, string2])
    conforms(validator, [string3])
    notConforms(validator, [integer])
    notConforms(validator, [namedNode])
  })
  it('should create an unconstrained shape', () => {
    const builder = new DatatypeConstraintBuilder(rdf, xsd.string)
    const validator = buildShape(builder, [string1, string2, namedNode])
    conforms(validator, [string1, string2, string3, integer, namedNode])
  })
})
