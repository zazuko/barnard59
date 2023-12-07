import rdf from 'barnard59-env'
import { fromRdf } from 'rdf-literal'
import { RangeConstraintBuilder } from '../../../lib/cube/buildCubeShape/Constraints.js'
import { createValidator, conforms, notConforms } from './support.js'

const { xsd } = rdf.ns

describe('RangeConstraintBuilder', () => {
  const [one, two, three, four, five, six, seven, eight] = [1, 2, 3, 4, 5, 6, 7, 8].map(x => rdf.literal(`${x}`, xsd.integer))
  const wrong = rdf.literal('wrong', xsd.integer)
  const string = rdf.literal('foo', xsd.string)
  const namedNode = rdf.namedNode('http://example.org/namedNode')

  it('should create a constrained shape', () => {
    const builder = new RangeConstraintBuilder(rdf, four, fromRdf)
    const validator = createValidator(builder, [two, three, seven])
    conforms(validator, [five, six])
    notConforms(validator, [one, eight])
  })
  it('should create an unconstrained shape due to wrong datatype', () => {
    const builder = new RangeConstraintBuilder(rdf, four, fromRdf)
    const validator = createValidator(builder, [one, string, seven])
    conforms(validator, [one, two, three, four, five, six, seven, eight, wrong, string, namedNode])
  })
  it('should create an unconstrained shape due to missing datatype', () => {
    const builder = new RangeConstraintBuilder(rdf, four, fromRdf)
    const validator = createValidator(builder, [one, namedNode, seven])
    conforms(validator, [one, two, three, four, five, six, seven, eight, wrong, string, namedNode])
  })
  it('should create an unconstrained shape due to unexpected value', () => {
    const builder = new RangeConstraintBuilder(rdf, four, fromRdf)
    const validator = createValidator(builder, [one, wrong, seven])
    conforms(validator, [one, two, three, four, five, six, seven, eight, wrong, string, namedNode])
  })
  it('should create an unconstrained shape due to parsing issue of initial value', () => {
    const builder = new RangeConstraintBuilder(rdf, wrong, fromRdf)
    const validator = createValidator(builder, [])
    conforms(validator, [one, two, three, four, five, six, seven, eight, wrong, string, namedNode])
  })
})
