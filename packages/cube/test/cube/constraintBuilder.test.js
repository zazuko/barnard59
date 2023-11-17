import { strictEqual, deepStrictEqual } from 'assert'
import rdf from 'barnard59-env'
import { fromRdf } from 'rdf-literal'
import {
  NodeKindConstraintBuilder,
  DatatypeConstraintBuilder,
  RangeConstraintBuilder,
  ValuesConstraintBuilder,
  DimensionConstraintsBuilder,
} from '../../lib/cube/buildCubeShape/Constraints.js'

const { xsd, sh, cube } = rdf.ns

describe('DatatypeConstraintBuilder', () => {
  it('should build a datatype constraint', () => {
    const builder = new DatatypeConstraintBuilder(rdf, xsd.string)
    const ptr = rdf.clownface().blankNode()
    builder.build(ptr)
    deepStrictEqual(ptr.out(sh.datatype).term, xsd.string)
  })
})

describe('RangeConstraintBuilder', () => {
  it('should build a range constraint', () => {
    const datatype = xsd.integer
    const one = rdf.literal('1', datatype)
    const four = rdf.literal('4', datatype)
    const seven = rdf.literal('7', datatype)
    const builder = new RangeConstraintBuilder(rdf, one, fromRdf)
    builder.add(four)
    builder.add(seven)

    const ptr = rdf.clownface().blankNode()
    builder.build(ptr)

    deepStrictEqual(ptr.out(sh.minInclusive).term, one)
    deepStrictEqual(ptr.out(sh.maxInclusive).term, seven)
  })
})

describe('ValuesConstraintBuilder', () => {
  it('should build a sh:in constraint with values', () => {
    const foo = rdf.namedNode('foo')
    const bar = rdf.literal('bar')
    const baz = rdf.namedNode('baz')
    const builder = new ValuesConstraintBuilder(rdf, foo)
    builder.add(bar)
    builder.add(baz)

    const ptr = rdf.clownface().blankNode()
    builder.build(ptr)

    const values = rdf.termSet([...ptr.out(sh.in).list()].map(x => x.term))
    strictEqual(values.size, 3)
    strictEqual(values.has(foo), true)
    strictEqual(values.has(bar), true)
    strictEqual(values.has(baz), true)
  })
  it('should skip sh:in constraint for too many values', () => {
    const foo = rdf.namedNode('foo')
    const bar = rdf.literal('bar')
    const baz = rdf.namedNode('baz')
    const builder = new ValuesConstraintBuilder(rdf, foo, 2)
    builder.add(bar)
    builder.add(baz)

    const ptr = rdf.clownface().blankNode()
    builder.build(ptr)

    strictEqual(ptr.has(sh.in).terms.length, 0)
    strictEqual(builder.message, 'Too many values for in-list constraint.')
  })
})

describe('NodeKindConstraintBuilder', () => {
  it('should build a sh:nodeKind constraint', () => {
    const builder = new NodeKindConstraintBuilder(rdf)
    builder.add(rdf.namedNode('foo'))
    builder.add(rdf.blankNode())

    const ptr = rdf.clownface().blankNode()
    builder.build(ptr)

    deepStrictEqual(ptr.out(sh.nodeKind).term, sh.BlankNodeOrIRI)
  })
  it('should not build a sh:nodeKind constraint when there are nodes of all kinds', () => {
    const builder = new NodeKindConstraintBuilder(rdf)
    builder.add(rdf.namedNode('foo'))
    builder.add(rdf.literal('foo'))
    builder.add(rdf.blankNode())

    const ptr = rdf.clownface().blankNode()
    builder.build(ptr)

    strictEqual(ptr.has(sh.nodeKind).terms.length, 0)
  })
})

const datatypeParsers = rdf.termMap([
  [xsd.integer, fromRdf],
])

describe('DimensionConstraintsBuilder', () => {
  it('should build only sh:in constraint', () => {
    const foo = rdf.namedNode('foo')
    const bar = rdf.namedNode('bar')
    const builder = new DimensionConstraintsBuilder({ rdf, datatypeParsers })
    builder.add(foo)
    builder.add(bar)

    const ptr = rdf.clownface().blankNode()
    builder.build(ptr)

    const values = rdf.termSet([...ptr.out(sh.in).list()].map(x => x.term))
    strictEqual(values.size, 2)
    strictEqual(values.has(foo), true)
    strictEqual(values.has(bar), true)
  })

  it('should build datatype and range constraints', () => {
    const datatype = xsd.integer
    const two = rdf.literal('2', datatype)
    const builder = new DimensionConstraintsBuilder({ rdf, datatypeParsers })
    builder.add(two)

    const ptr = rdf.clownface().blankNode()
    builder.build(ptr)

    deepStrictEqual(ptr.out(sh.datatype).term, datatype)
    deepStrictEqual(ptr.out(sh.minInclusive).term, two)
    deepStrictEqual(ptr.out(sh.maxInclusive).term, two)
  })

  it('should build sh:datatype constraints', () => {
    const builder = new DimensionConstraintsBuilder({ rdf, datatypeParsers })
    builder.add(rdf.literal('', cube.Undefined))
    builder.add(rdf.literal('2', xsd.integer))
    const ptr = rdf.clownface().blankNode()
    builder.build(ptr)
    const constraints = [...ptr.out(sh.or).list()]
    deepStrictEqual(constraints.length, 2)
    // TODO: more assertions
  })

  it('should build sh:datatype and sh:in constraints', () => {
    const builder = new DimensionConstraintsBuilder({ rdf, datatypeParsers })
    builder.add(rdf.namedNode('foo'))
    builder.add(rdf.literal('2', xsd.integer))
    const ptr = rdf.clownface().blankNode()
    builder.build(ptr)
    const constraints = [...ptr.out(sh.or).list()]
    deepStrictEqual(constraints.length, 2)
    // TODO: more assertions
  })
})
