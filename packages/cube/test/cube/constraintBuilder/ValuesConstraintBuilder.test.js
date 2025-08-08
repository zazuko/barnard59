import { strictEqual } from 'assert'
import rdf from 'barnard59-env'
import { ValuesConstraintBuilder } from '../../../lib/cube/buildCubeShape/constraintBuilder/ValuesConstraintBuilder.js'
import { prepareValidator } from './support.js'

const { xsd } = rdf.ns

describe('ValuesConstraintBuilder', () => {
  const string = rdf.literal('foo', xsd.string)
  const integer = rdf.literal('2', xsd.integer)
  const namedNode = rdf.namedNode('http://example.org/namedNode')
  const blankNode = rdf.blankNode('b1')
  const other = rdf.namedNode('http://example.org/other')

  context('built without threshold', () => {
    before(prepareValidator(new ValuesConstraintBuilder(rdf), string, integer, namedNode, blankNode))

    it('values used to build the shape conform', function () { this.assertConforms(string, integer, namedNode, blankNode) })
    it('other values do not conform', function () { this.assertNotConforms(other) })
  })
  context('built with too many values', () => {
    const threshold = 2
    before(prepareValidator(new ValuesConstraintBuilder(rdf, threshold), string, integer, namedNode, blankNode))

    it('everything conforms', function () { this.assertConforms(string, integer, namedNode, blankNode, other) })
    it('reports too many values', function () { strictEqual(this.builder.message, 'Too many values for in-list constraint.') })
  })
})
