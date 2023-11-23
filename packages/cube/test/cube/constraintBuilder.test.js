import { strictEqual } from 'assert'
import rdf from 'barnard59-env'
import { fromRdf } from 'rdf-literal'
import SHACLValidator from 'rdf-validate-shacl'
import {
  NodeKindConstraintBuilder,
  DatatypeConstraintBuilder,
  RangeConstraintBuilder,
  ValuesConstraintBuilder,
  DimensionConstraintsBuilder,
} from '../../lib/cube/buildCubeShape/Constraints.js'

const { xsd, sh } = rdf.ns

const subject = rdf.namedNode('http://example.org/subject')
const property = rdf.namedNode('http://example.org/property')

const createDataset = values =>
  rdf.clownface().namedNode(subject).addOut(property, values).dataset

const conforms = (validator, values) => {
  const report = validator.validate(createDataset(values))
  strictEqual(report.conforms, true)
}

const notConforms = (validator, values) => {
  const report = validator.validate(createDataset(values))
  strictEqual(report.conforms, false)
}

const createValidator = (builder, values) => {
  const shape = rdf.clownface()
  const ptr = shape.blankNode()
  shape.namedNode('http://example.org/shape')
    .addOut(sh.targetNode, subject)
    .addOut(sh.property, ptr)
  ptr.addOut(sh.path, property)

  values.forEach(x => builder.add(x))
  builder.build(ptr)
  // console.log(shape.dataset.toCanonical())

  const validator = new SHACLValidator(shape.dataset, { factory: rdf })
  conforms(validator, values)
  return validator
}

describe('DatatypeConstraintBuilder', () => {
  const string1 = rdf.literal('foo', xsd.string)
  const string2 = rdf.literal('bar', xsd.string)
  const string3 = rdf.literal('baz', xsd.string)
  const integer = rdf.literal('2', xsd.integer)
  const namedNode = rdf.namedNode('http://example.org/namedNode')

  it('should create a constrained shape', () => {
    const builder = new DatatypeConstraintBuilder(rdf, xsd.string)
    const validator = createValidator(builder, [string1, string2])
    conforms(validator, [string3])
    notConforms(validator, [integer])
    notConforms(validator, [namedNode])
  })
  it('should create an unconstrained shape', () => {
    const builder = new DatatypeConstraintBuilder(rdf, xsd.string)
    const validator = createValidator(builder, [string1, string2, namedNode])
    conforms(validator, [string1, string2, string3, integer, namedNode])
  })
})

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

describe('ValuesConstraintBuilder', () => {
  const string = rdf.literal('foo', xsd.string)
  const integer = rdf.literal('2', xsd.integer)
  const namedNode = rdf.namedNode('http://example.org/namedNode')
  const blankNode = rdf.blankNode('b1')
  const other = rdf.namedNode('http://example.org/other')

  it('should create a constrained shape', () => {
    const builder = new ValuesConstraintBuilder(rdf, string)
    const validator = createValidator(builder, [integer, namedNode, blankNode])
    conforms(validator, [string, integer, namedNode, blankNode])
    notConforms(validator, [other])
  })
  it('should create an unconstrained shape due to too many values', () => {
    const threshold = 2
    const builder = new ValuesConstraintBuilder(rdf, string, threshold)
    const validator = createValidator(builder, [integer, namedNode, blankNode])
    conforms(validator, [string, integer, namedNode, blankNode, other])
    strictEqual(builder.message, 'Too many values for in-list constraint.')
  })
})

describe('NodeKindConstraintBuilder', () => {
  const literal1 = rdf.literal('foo', xsd.string)
  const literal2 = rdf.literal('3', xsd.integer)
  const namedNode1 = rdf.namedNode('http://example.org/namedNode1')
  const namedNode2 = rdf.namedNode('http://example.org/namedNode2')
  const blankNode1 = rdf.blankNode('b1')
  const blankNode2 = rdf.blankNode('b2')
  it('should create a constrained shape', () => {
    const builder = new NodeKindConstraintBuilder(rdf)
    const validator = createValidator(builder, [literal1, namedNode1])
    conforms(validator, [literal2, namedNode2])
    notConforms(validator, [blankNode1])
    notConforms(validator, [blankNode2])
  })
  it('should create an unconstrained shape', () => {
    const builder = new NodeKindConstraintBuilder(rdf)
    const validator = createValidator(builder, [literal1, namedNode1, blankNode1])
    conforms(validator, [literal2, namedNode2, blankNode2])
  })
})

const datatypeParsers = rdf.termMap([
  [xsd.integer, fromRdf],
])

describe('DimensionConstraintsBuilder', () => {
  const namedNode1 = rdf.namedNode('http://example.org/namedNode1')
  const namedNode2 = rdf.namedNode('http://example.org/namedNode2')
  const namedNode3 = rdf.namedNode('http://example.org/namedNode3')
  const string1 = rdf.literal('foo', xsd.string)
  const string2 = rdf.literal('bar', xsd.string)
  const string3 = rdf.literal('baz', xsd.string)
  const one = rdf.literal('1', xsd.integer)
  const two = rdf.literal('2', xsd.integer)
  const three = rdf.literal('3', xsd.integer)

  it('should create a shape constrained to some named nodes', () => {
    const builder = new DimensionConstraintsBuilder({ rdf, datatypeParsers })
    const validator = createValidator(builder, [namedNode1, namedNode2])
    conforms(validator, [namedNode1, namedNode2])
    notConforms(validator, [namedNode3])
    notConforms(validator, [string1])
    notConforms(validator, [one])
  })
  it('should create a shape unconstrained', () => {
    const builder = new DimensionConstraintsBuilder({ rdf, datatypeParsers, inListThreshold: 1 })
    const validator = createValidator(builder, [namedNode1, namedNode2])
    conforms(validator, [namedNode1, namedNode2, namedNode3, string1, one])
  })
  it('should create a shape constrained to some strings', () => {
    const builder = new DimensionConstraintsBuilder({ rdf, datatypeParsers })
    const validator = createValidator(builder, [string1, string2])
    conforms(validator, [string1, string2])
    notConforms(validator, [string3])
    notConforms(validator, [one])
    notConforms(validator, [namedNode1])
  })
  it('should create a shape constrained to all strings', () => {
    const builder = new DimensionConstraintsBuilder({ rdf, datatypeParsers, inListThreshold: 1 })
    const validator = createValidator(builder, [string1, string2])
    conforms(validator, [string1, string2, string3])
    notConforms(validator, [one])
    notConforms(validator, [namedNode1])
  })
  it('should create a shape constrained to numbers in range', () => {
    const builder = new DimensionConstraintsBuilder({ rdf, datatypeParsers })
    const validator = createValidator(builder, [one, three])
    conforms(validator, [two])
    notConforms(validator, [string1])
    notConforms(validator, [namedNode1])
  })
  it('should create a shape constrained to (sh:or) alternatives', () => {
    const builder = new DimensionConstraintsBuilder({ rdf, datatypeParsers })
    const validator = createValidator(builder, [namedNode1, namedNode2, string1, string2, one, three])
    conforms(validator, [two])
    notConforms(validator, [string3])
    notConforms(validator, [namedNode3])
  })
})
