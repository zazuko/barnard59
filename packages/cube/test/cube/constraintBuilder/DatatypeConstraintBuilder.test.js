import rdf from 'barnard59-env'
import { DatatypeConstraintBuilder } from '../../../lib/cube/buildCubeShape/constraintBuilder/DatatypeConstraintBuilder.js'
import { prepareValidator } from './support.js'

const { xsd } = rdf.ns

describe('DatatypeConstraintBuilder', () => {
  const string1 = rdf.literal('foo', xsd.string)
  const string2 = rdf.literal('bar', xsd.string)
  const string3 = rdf.literal('baz', xsd.string)
  const integer = rdf.literal('2', xsd.integer)
  const namedNode = rdf.namedNode('http://example.org/namedNode')

  context('built from all strings', () => {
    before(prepareValidator(new DatatypeConstraintBuilder(rdf, xsd.string), string1, string2))

    it('string conforms', function () { this.assertConforms(string3) })
    it('integer does not conform', function () { this.assertNotConforms(integer) })
    it('named node does not conform', function () { this.assertNotConforms(namedNode) })
  })
  context('built from not only strings', () => {
    before(prepareValidator(new DatatypeConstraintBuilder(rdf, xsd.string), string1, string2, namedNode))

    it('everything conforms', function () { this.assertConforms(string1, string2, string3, integer, namedNode) })
  })
})
