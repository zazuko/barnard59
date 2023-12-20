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

  context('built without threshold', () => {
    const builder = new ValuesConstraintBuilder(rdf, string)
    const validator = buildShape(builder, [string, integer, namedNode, blankNode])
    const assertConforms = conforms.bind(null, validator)
    const assertNotConforms = notConforms.bind(null, validator)
    it('values used to build the shape conform', () => assertConforms([string, integer, namedNode, blankNode]))
    it('other values do not conform', () => assertNotConforms([other]))
  })
  context('built with too many values', () => {
    const threshold = 2
    const builder = new ValuesConstraintBuilder(rdf, string, threshold)
    const validator = buildShape(builder, [string, integer, namedNode, blankNode])
    const assertConforms = conforms.bind(null, validator)

    it('everything conforms', () => assertConforms([string, integer, namedNode, blankNode, other]))
    it('reports too many values', () => strictEqual(builder.message, 'Too many values for in-list constraint.'))
  })
})
