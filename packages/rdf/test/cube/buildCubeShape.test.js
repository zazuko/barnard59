import { deepStrictEqual, strictEqual } from 'assert'
import TermSet from '@rdfjs/term-set'
import { termToNTriples as toNT } from '@rdfjs/to-ntriples'
import clownface from 'clownface'
import { isDuplex } from 'isstream'
import { describe, it } from 'mocha'
import rdf from 'rdf-ext'
import buildCubeShape from '../../lib/cube/buildCubeShape/index.js'
import createObservationsStream from '../support/createObservationsStream.js'
import datasetStreamToClownface from '../support/datasetStreamToClownface.js'
import * as ns from '../support/namespaces.js'

function checkMinMax (result, min, max) {
  const propertyShape = result.has(ns.sh.path, ns.ex.property)
  const shapeMin = propertyShape.out(ns.sh.minInclusive)
  const shapeMax = propertyShape.out(ns.sh.maxInclusive)

  strictEqual(toNT(shapeMin.term), toNT(min))
  strictEqual(toNT(shapeMax.term), toNT(max))
}

describe('cube.buildCubeShape', () => {
  it('should be a factory', () => {
    strictEqual(typeof buildCubeShape, 'function')
  })

  it('should return a duplex stream', async () => {
    const transform = buildCubeShape()

    strictEqual(isDuplex(transform), true)
  })

  it('should create a cube', async () => {
    const input = createObservationsStream()
    const transform = buildCubeShape()

    input.pipe(transform)

    const result = await datasetStreamToClownface(transform)

    const cube = result.has(ns.rdf.type, ns.cube.Cube)

    strictEqual(cube.terms.length, 1)
  })

  it('should use the observation IRI to build the cube IRI', async () => {
    const input = createObservationsStream()
    const transform = buildCubeShape()

    input.pipe(transform)

    const result = await datasetStreamToClownface(transform)

    const cube = result
      .node(ns.ex('cube'))
      .has(ns.rdf.type, ns.cube.Cube)

    strictEqual(cube.terms.length, 1)
  })

  it('should create a observation set', async () => {
    const input = createObservationsStream()
    const transform = buildCubeShape()

    input.pipe(transform)

    const result = await datasetStreamToClownface(transform)

    const observationSet = result.has(ns.rdf.type, ns.cube.ObservationSet)

    strictEqual(observationSet.terms.length, 1)
  })

  it('should use the observation IRI to build the observation set IRI', async () => {
    const input = createObservationsStream()
    const transform = buildCubeShape()

    input.pipe(transform)

    const result = await datasetStreamToClownface(transform)

    const cube = result
      .node(ns.ex('cube/observation/'))
      .has(ns.rdf.type, ns.cube.ObservationSet)

    strictEqual(cube.terms.length, 1)
  })

  it('should point from the cube to the observation set', async () => {
    const input = createObservationsStream()
    const transform = buildCubeShape()

    input.pipe(transform)

    const result = await datasetStreamToClownface(transform)

    const observationSet = result
      .node(ns.ex('cube'))
      .has(ns.cube.observationSet, ns.ex('cube/observation/'))

    strictEqual(observationSet.terms.length, 1)
  })

  it('should create a shape', async () => {
    const input = createObservationsStream()
    const transform = buildCubeShape()

    input.pipe(transform)

    const result = await datasetStreamToClownface(transform)

    const shape = result.has(ns.rdf.type, ns.sh.NodeShape)

    strictEqual(shape.terms.length, 1)
  })

  it('should use the observation IRI to build the shape IRI', async () => {
    const input = createObservationsStream()
    const transform = buildCubeShape()

    input.pipe(transform)

    const result = await datasetStreamToClownface(transform)

    const shape = result
      .node(ns.ex('cube/shape'))
      .has(ns.rdf.type, ns.sh.NodeShape)

    strictEqual(shape.terms.length, 1)
  })

  it('should point from the cube to the shape', async () => {
    const input = createObservationsStream()
    const transform = buildCubeShape()

    input.pipe(transform)

    const result = await datasetStreamToClownface(transform)

    const cube = result
      .node(ns.ex('cube'))
      .has(ns.cube.observationConstraint, ns.ex('cube/shape'))

    strictEqual(cube.terms.length, 1)
  })

  it('should generate a property shape for each dimension', async () => {
    const input = createObservationsStream({
      observations: [{
        [ns.ex.propertyA.value]: rdf.literal('A'),
        [ns.ex.propertyB.value]: rdf.literal('B')
      }]
    })
    const transform = buildCubeShape()

    input.pipe(transform)

    const result = await datasetStreamToClownface(transform)

    const propertyShapes = result.node(ns.ex('cube/shape')).out(ns.sh.property)
    const pathes = new TermSet(propertyShapes.out(ns.sh.path).terms)

    strictEqual(propertyShapes.terms.length, 3)
    strictEqual(pathes.has(ns.rdf.type), true)
    strictEqual(pathes.has(ns.ex.propertyA), true)
    strictEqual(pathes.has(ns.ex.propertyB), true)
  })

  it('should generate nodeKind for literal values', async () => {
    const input = createObservationsStream({
      observations: [{
        [ns.ex.property.value]: rdf.literal('A')
      }, {
        [ns.ex.property.value]: rdf.literal('B')
      }]
    })
    const transform = buildCubeShape()

    input.pipe(transform)

    const result = await datasetStreamToClownface(transform)

    const propertyShape = result.has(ns.sh.path, ns.ex.property)
    const nodeKind = propertyShape.out(ns.sh.nodeKind)

    strictEqual(toNT(nodeKind.term), toNT(ns.sh.Literal))
  })

  it('should generate nodeKind for named node values', async () => {
    const input = createObservationsStream({
      observations: [{
        [ns.ex.property.value]: ns.ex.valueA
      }, {
        [ns.ex.property.value]: ns.ex.valueB
      }]
    })
    const transform = buildCubeShape()

    input.pipe(transform)

    const result = await datasetStreamToClownface(transform)

    const propertyShape = result.has(ns.sh.path, ns.ex.property)
    const nodeKind = propertyShape.out(ns.sh.nodeKind)

    strictEqual(toNT(nodeKind.term), toNT(ns.sh.IRI))
  })

  it('should generate a sh:in list for plain string values', async () => {
    const input = createObservationsStream({
      observations: [{
        [ns.ex.property.value]: rdf.literal('A')
      }, {
        [ns.ex.property.value]: rdf.literal('B')
      }]
    })
    const transform = buildCubeShape()

    input.pipe(transform)

    const result = await datasetStreamToClownface(transform)

    const propertyShape = result.has(ns.sh.path, ns.ex.property)
    const values = [...propertyShape.out(ns.sh.in).list()].map(ptr => ptr.value).sort()

    deepStrictEqual(values, ['A', 'B'])
  })

  it('should generate a sh:in list for named node values', async () => {
    const input = createObservationsStream({
      observations: [{
        [ns.ex.property.value]: ns.ex.valueA
      }, {
        [ns.ex.property.value]: ns.ex.valueB
      }]
    })
    const transform = buildCubeShape()

    input.pipe(transform)

    const result = await datasetStreamToClownface(transform)

    const propertyShape = result.has(ns.sh.path, ns.ex.property)
    const values = new TermSet([...propertyShape.out(ns.sh.in).list()].map(ptr => ptr.term))

    strictEqual(values.has(ns.ex.valueA), true)
    strictEqual(values.has(ns.ex.valueB), true)
  })

  it('should generate sh:minInclusive an sh:maxInclusive properties for date values', async () => {
    const min = rdf.literal('2000-01-01T00:00:00.000Z', ns.xsd.date)
    const max = rdf.literal('2000-01-03T00:00:00.000Z', ns.xsd.date)
    const input = createObservationsStream({
      observations: [{
        [ns.ex.property.value]: rdf.literal('2000-01-02T00:00:00.000Z', ns.xsd.date)
      }, {
        [ns.ex.property.value]: max
      }, {
        [ns.ex.property.value]: min
      }]
    })
    const transform = buildCubeShape()

    input.pipe(transform)

    const result = await datasetStreamToClownface(transform)

    checkMinMax(result, min, max)
  })

  it('should generate sh:minInclusive an sh:maxInclusive properties for double values', async () => {
    const min = rdf.literal('1.1', ns.xsd.double)
    const max = rdf.literal('3.3', ns.xsd.double)
    const input = createObservationsStream({
      observations: [{
        [ns.ex.property.value]: rdf.literal('2.2', ns.xsd.double)
      }, {
        [ns.ex.property.value]: max
      }, {
        [ns.ex.property.value]: min
      }]
    })
    const transform = buildCubeShape()

    input.pipe(transform)

    const result = await datasetStreamToClownface(transform)

    checkMinMax(result, min, max)
  })

  it('should generate sh:minInclusive an sh:maxInclusive properties for float values', async () => {
    const min = rdf.literal('1.1', ns.xsd.float)
    const max = rdf.literal('3.3', ns.xsd.float)
    const input = createObservationsStream({
      observations: [{
        [ns.ex.property.value]: rdf.literal('2.2', ns.xsd.float)
      }, {
        [ns.ex.property.value]: max
      }, {
        [ns.ex.property.value]: min
      }]
    })
    const transform = buildCubeShape()

    input.pipe(transform)

    const result = await datasetStreamToClownface(transform)

    checkMinMax(result, min, max)
  })

  it('should generate sh:minInclusive an sh:maxInclusive properties for int values', async () => {
    const min = rdf.literal('1', ns.xsd.int)
    const max = rdf.literal('3', ns.xsd.int)
    const input = createObservationsStream({
      observations: [{
        [ns.ex.property.value]: rdf.literal('2', ns.xsd.int)
      }, {
        [ns.ex.property.value]: max
      }, {
        [ns.ex.property.value]: min
      }]
    })
    const transform = buildCubeShape()

    input.pipe(transform)

    const result = await datasetStreamToClownface(transform)

    checkMinMax(result, min, max)
  })

  it('should generate sh:minInclusive an sh:maxInclusive properties for gYear values', async () => {
    const min = rdf.literal('0099', ns.xsd.gYear)
    const max = rdf.literal('1300', ns.xsd.gYear)
    const input = createObservationsStream({
      observations: [{
        [ns.ex.property.value]: rdf.literal('0100', ns.xsd.gYear)
      }, {
        [ns.ex.property.value]: max
      }, {
        [ns.ex.property.value]: min
      }]
    })
    const transform = buildCubeShape()

    input.pipe(transform)

    const result = await datasetStreamToClownface(transform)

    checkMinMax(result, min, max)
  })

  it('should generate sh:minInclusive an sh:maxInclusive properties for integer values', async () => {
    const min = rdf.literal('1', ns.xsd.integer)
    const max = rdf.literal('3', ns.xsd.integer)
    const input = createObservationsStream({
      observations: [{
        [ns.ex.property.value]: rdf.literal('2', ns.xsd.integer)
      }, {
        [ns.ex.property.value]: max
      }, {
        [ns.ex.property.value]: min
      }]
    })
    const transform = buildCubeShape()

    input.pipe(transform)

    const result = await datasetStreamToClownface(transform)

    checkMinMax(result, min, max)
  })

  it('should generate sh:or for multiple datatypes', async () => {
    const input = createObservationsStream({
      observations: [{
        [ns.ex.property.value]: rdf.literal('a', ns.xsd.integer)
      }, {
        [ns.ex.property.value]: rdf.literal('', ns.cube.Undefined)
      }]
    })
    const transform = buildCubeShape()

    input.pipe(transform)

    const result = await datasetStreamToClownface(transform)

    const propertyShape = result.has(ns.sh.path, ns.ex.property)
    const datatypes = new TermSet([...propertyShape.out(ns.sh.or).list()].map(or => or.out(ns.sh.datatype).term))

    strictEqual(datatypes.has(ns.xsd.integer), true)
    strictEqual(datatypes.has(ns.cube.Undefined), true)
  })

  it('should merge given metadata to cube metadata', async () => {
    const metadata = rdf.dataset([
      rdf.quad(ns.ex.cube, ns.schema.name, rdf.literal('Test Cube')),
      rdf.quad(ns.ex.other, ns.schema.name, rdf.literal('Test Other'))
    ]).toStream()
    const input = createObservationsStream({
      observations: [{
        [ns.ex.property.value]: rdf.literal('test')
      }]
    })
    const transform = buildCubeShape({ metadata })

    input.pipe(transform)

    const result = await datasetStreamToClownface(transform)

    const cubeName = result.out(ns.schema.name).term

    strictEqual(rdf.literal('Test Cube').equals(cubeName), true)
  })

  it('should ignore cube:observationConstraint property in cube metadata', async () => {
    const metadata = rdf.dataset([
      rdf.quad(ns.ex.cube, ns.cube.observationConstraint, ns.ex.shape)
    ]).toStream()
    const input = createObservationsStream({
      observations: [{
        [ns.ex.property.value]: rdf.literal('test')
      }]
    })
    const transform = buildCubeShape({ metadata })

    input.pipe(transform)

    const result = await datasetStreamToClownface(transform)

    const constraints = result.out(ns.cube.observationConstraint).terms

    strictEqual(constraints.length, 1)
    strictEqual(constraints[0].equals(ns.ex.shape), false)
  })

  it('should merge given metadata to dimension metadata', async () => {
    const dataset = rdf.dataset()

    clownface({ dataset, term: ns.ex.cube })
      .addOut(ns.cube.observationConstraint, shape => {
        shape.addOut(ns.sh.property, property => {
          property
            .addOut(ns.sh.path, ns.ex.property1)
            .addOut(ns.schema.name, 'Test Property')
        })
      })

    clownface({ dataset, term: ns.ex.otherCube })
      .addOut(ns.cube.observationConstraint, shape => {
        shape.addOut(ns.sh.property, property => {
          property
            .addOut(ns.sh.path, ns.ex.property1)
            .addOut(ns.schema.name, 'Other Property')
        })
      })

    console.log(dataset.toString())

    const input = createObservationsStream({
      observations: [{
        [ns.ex.property1.value]: rdf.literal('A'),
        [ns.ex.property2.value]: rdf.literal('B')
      }]
    })
    const transform = buildCubeShape({ metadata: dataset.toStream() })

    input.pipe(transform)

    const result = await datasetStreamToClownface(transform)

    const property1Name = result.has(ns.sh.path, ns.ex.property1)
      .out(ns.schema.name).term

    console.log(result.dataset.toString())

    strictEqual(rdf.literal('Test Property').equals(property1Name), true)
  })
})
