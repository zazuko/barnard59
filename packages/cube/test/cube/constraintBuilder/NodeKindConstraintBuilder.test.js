import rdf from 'barnard59-env'
import { NodeKindConstraintBuilder } from '../../../lib/cube/buildCubeShape/constraintBuilder/NodeKindConstraintBuilder.js'
import { buildShape, conforms, notConforms } from './support.js'

const { xsd } = rdf.ns

describe('NodeKindConstraintBuilder', () => {
  const literal1 = rdf.literal('foo', xsd.string)
  const literal2 = rdf.literal('3', xsd.integer)
  const literal3 = rdf.literal('3.0', xsd.decimal)
  const namedNode1 = rdf.namedNode('http://example.org/namedNode1')
  const namedNode2 = rdf.namedNode('http://example.org/namedNode2')
  const namedNode3 = rdf.namedNode('http://example.org/namedNode3')
  const blankNode1 = rdf.blankNode('b1')
  const blankNode2 = rdf.blankNode('b2')
  const blankNode3 = rdf.blankNode('b3')

  context('built from all kinds of nodes', () => {
    const builder = new NodeKindConstraintBuilder(rdf)
    const validator = buildShape(builder, literal1, namedNode1, blankNode1)
    const assertConforms = conforms.bind(null, validator)
    it('everything conforms', () => assertConforms(literal1, literal2, namedNode1, namedNode2, blankNode1, blankNode2))
  })
  context('built from literals', () => {
    const builder = new NodeKindConstraintBuilder(rdf)
    const validator = buildShape(builder, literal1, literal2)
    const assertConforms = conforms.bind(null, validator)
    const assertNotConforms = notConforms.bind(null, validator)
    it('literals conform', () => assertConforms(literal1, literal2, literal3))
    it('named nodes do not conform', () => assertNotConforms(namedNode1, namedNode2, namedNode3))
    it('blank nodes do not conform', () => assertNotConforms(blankNode1, blankNode2, blankNode3))
  })
  context('built from literals and named nodes', () => {
    const builder = new NodeKindConstraintBuilder(rdf)
    const validator = buildShape(builder, literal1, namedNode1, literal2)
    const assertConforms = conforms.bind(null, validator)
    const assertNotConforms = notConforms.bind(null, validator)
    it('literals conform', () => assertConforms(literal1, literal2, literal3))
    it('named nodes conform', () => assertConforms(namedNode1, namedNode2, namedNode3))
    it('blank nodes do not conform', () => assertNotConforms(blankNode1, blankNode2, blankNode3))
  })
})
