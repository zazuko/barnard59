import { strictEqual } from 'assert'
import rdf from 'barnard59-env'
import { ValuesConstraintBuilder } from '../../../lib/cube/buildCubeShape/Constraints.js'
import { buildShape, conforms, notConforms } from './support.js'

const { xsd } = rdf.ns

describe('ValuesConstraintBuilder', () => {
  const string = rdf.literal('foo', xsd.string)
  const integer = rdf.literal('2', xsd.integer)
  const namedNode = rdf.namedNode('http://example.org/namedNode')
  const blankNode = rdf.blankNode('b1')
  const other = rdf.namedNode('http://example.org/other')

  it('should create a constrained shape', () => {
    const builder = new ValuesConstraintBuilder(rdf, string)
    const validator = buildShape(builder, [integer, namedNode, blankNode])
    conforms(validator, [string, integer, namedNode, blankNode])
    notConforms(validator, [other])
  })
  it('should create an unconstrained shape due to too many values', () => {
    const threshold = 2
    const builder = new ValuesConstraintBuilder(rdf, string, threshold)
    const validator = buildShape(builder, [integer, namedNode, blankNode])
    conforms(validator, [string, integer, namedNode, blankNode, other])
    strictEqual(builder.message, 'Too many values for in-list constraint.')
  })
})
