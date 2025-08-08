import rdf from 'barnard59-env'
import { NodeKindConstraintBuilder } from '../../../lib/cube/buildCubeShape/constraintBuilder/NodeKindConstraintBuilder.js'
import { prepareValidator } from './support.js'

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
    before(prepareValidator(new NodeKindConstraintBuilder(rdf), literal1, namedNode1, blankNode1))

    it('everything conforms', function () { this.assertConforms(literal1, literal2, namedNode1, namedNode2, blankNode1, blankNode2) })
  })
  context('built from literals', () => {
    before(prepareValidator(new NodeKindConstraintBuilder(rdf), literal1, literal2))

    it('literals conform', function () { this.assertConforms(literal1, literal2, literal3) })
    it('named nodes do not conform', function () { this.assertNotConforms(namedNode1, namedNode2, namedNode3) })
    it('blank nodes do not conform', function () { this.assertNotConforms(blankNode1, blankNode2, blankNode3) })
  })
  context('built from literals and named nodes', () => {
    before(prepareValidator(new NodeKindConstraintBuilder(rdf), literal1, namedNode1, literal2))

    it('literals conform', function () { this.assertConforms(literal1, literal2, literal3) })
    it('named nodes conform', function () { this.assertConforms(namedNode1, namedNode2, namedNode3) })
    it('blank nodes do not conform', function () { this.assertNotConforms(blankNode1, blankNode2, blankNode3) })
  })
})
