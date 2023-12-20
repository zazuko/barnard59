import rdf from 'barnard59-env'
import { DatatypeConstraintBuilder } from '../../../lib/cube/buildCubeShape/constraintBuilder/DatatypeConstraintBuilder.js'
import { buildShape, conforms, notConforms } from './support.js'

const { xsd } = rdf.ns

describe('DatatypeConstraintBuilder', () => {
  const string1 = rdf.literal('foo', xsd.string)
  const string2 = rdf.literal('bar', xsd.string)
  const string3 = rdf.literal('baz', xsd.string)
  const integer = rdf.literal('2', xsd.integer)
  const namedNode = rdf.namedNode('http://example.org/namedNode')

  context('built from all strings', () => {
    const builder = new DatatypeConstraintBuilder(rdf, xsd.string)
    const validator = buildShape(builder, [string1, string2])
    const assertConforms = conforms.bind(null, validator)
    const assertNotConforms = notConforms.bind(null, validator)

    it('string conforms', () => assertConforms([string3]))
    it('integer does not conform', () => assertNotConforms([integer]))
    it('named node does not conform', () => assertNotConforms([namedNode]))
  })
  context('built from not only strings', () => {
    const builder = new DatatypeConstraintBuilder(rdf, xsd.string)
    const validator = buildShape(builder, [string1, string2, namedNode])
    const assertConforms = conforms.bind(null, validator)

    it('everything conforms', () => assertConforms([string1, string2, string3, integer, namedNode]))
  })
})
