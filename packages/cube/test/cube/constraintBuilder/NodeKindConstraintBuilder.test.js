import rdf from 'barnard59-env'
import { NodeKindConstraintBuilder } from '../../../lib/cube/buildCubeShape/Constraints.js'
import { buildShape, conforms, notConforms } from './support.js'

const { xsd } = rdf.ns

describe('NodeKindConstraintBuilder', () => {
  const literal1 = rdf.literal('foo', xsd.string)
  const literal2 = rdf.literal('3', xsd.integer)
  const namedNode1 = rdf.namedNode('http://example.org/namedNode1')
  const namedNode2 = rdf.namedNode('http://example.org/namedNode2')
  const blankNode1 = rdf.blankNode('b1')
  const blankNode2 = rdf.blankNode('b2')
  it('should create a constrained shape', () => {
    const builder = new NodeKindConstraintBuilder(rdf)
    const validator = buildShape(builder, [literal1, namedNode1])
    conforms(validator, [literal2, namedNode2])
    notConforms(validator, [blankNode1])
    notConforms(validator, [blankNode2])
  })
  it('should create an unconstrained shape', () => {
    const builder = new NodeKindConstraintBuilder(rdf)
    const validator = buildShape(builder, [literal1, namedNode1, blankNode1])
    conforms(validator, [literal2, namedNode2, blankNode2])
  })
})
