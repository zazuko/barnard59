import { deepStrictEqual, strictEqual } from 'assert'
import toNT from '@rdfjs/to-ntriples'
import { isDuplexStream as isDuplex } from 'is-stream'
import rdf from '@zazuko/env'
import toStream from 'rdf-dataset-ext/toStream.js'
import { expect } from 'chai'
import buildCubeShape from '../../lib/cube/buildCubeShape/index.js'
import createObservationsStream from '../support/createObservationsStream.js'
import datasetStreamToClownface from '../support/datasetStreamToClownface.js'
import * as ns from '../support/namespaces.js'

function checkMinMax(result, min, max) {
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
        [ns.ex.propertyB.value]: rdf.literal('B'),
      }],
    })
    const transform = buildCubeShape()

    input.pipe(transform)

    const result = await datasetStreamToClownface(transform)

    const propertyShapes = result.node(ns.ex('cube/shape')).out(ns.sh.property)
    const pathes = rdf.termSet(propertyShapes.out(ns.sh.path).terms)

    strictEqual(propertyShapes.terms.length, 3)
    strictEqual(pathes.has(ns.rdf.type), true)
    strictEqual(pathes.has(ns.ex.propertyA), true)
    strictEqual(pathes.has(ns.ex.propertyB), true)
  })

  it('should generate a NamedNode property shape for each dimension', async () => {
    const input = createObservationsStream({
      observations: [{
        [ns.ex.propertyA.value]: rdf.literal('A'),
        [ns.ex.propertyB.value]: rdf.literal('B'),
      }],
    })
    const transform = buildCubeShape({
      propertyShapeId(cube, dimension) {
        return rdf.namedNode(`${cube.term.value}/dim?id=${dimension.predicate.value}`)
      },
    })

    input.pipe(transform)

    const result = await datasetStreamToClownface(transform)

    const propertyShapes = result.node(ns.ex('cube/shape')).out(ns.sh.property)

    expect(propertyShapes.terms).to.deep.contain.all.members([
      rdf.namedNode('http://example.org/cube/dim?id=http://www.w3.org/1999/02/22-rdf-syntax-ns#type'),
      rdf.namedNode('http://example.org/cube/dim?id=http://example.org/propertyA'),
      rdf.namedNode('http://example.org/cube/dim?id=http://example.org/propertyB'),
    ])
  })

  it('should generate nodeKind for literal values', async () => {
    const input = createObservationsStream({
      observations: [{
        [ns.ex.property.value]: rdf.literal('A'),
      }, {
        [ns.ex.property.value]: rdf.literal('B'),
      }],
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
        [ns.ex.property.value]: ns.ex.valueA,
      }, {
        [ns.ex.property.value]: ns.ex.valueB,
      }],
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
        [ns.ex.property.value]: rdf.literal('A'),
      }, {
        [ns.ex.property.value]: rdf.literal('B'),
      }],
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
        [ns.ex.property.value]: ns.ex.valueA,
      }, {
        [ns.ex.property.value]: ns.ex.valueB,
      }],
    })
    const transform = buildCubeShape()

    input.pipe(transform)

    const result = await datasetStreamToClownface(transform)

    const propertyShape = result.has(ns.sh.path, ns.ex.property)
    const values = rdf.termSet([...propertyShape.out(ns.sh.in).list()].map(ptr => ptr.term))

    strictEqual(values.has(ns.ex.valueA), true)
    strictEqual(values.has(ns.ex.valueB), true)
  })

  it('should generate sh:minInclusive an sh:maxInclusive properties for date values', async () => {
    const min = rdf.literal('2000-01-01T00:00:00.000Z', ns.xsd.date)
    const max = rdf.literal('2000-01-03T00:00:00.000Z', ns.xsd.date)
    const input = createObservationsStream({
      observations: [{
        [ns.ex.property.value]: rdf.literal('2000-01-02T00:00:00.000Z', ns.xsd.date),
      }, {
        [ns.ex.property.value]: max,
      }, {
        [ns.ex.property.value]: min,
      }],
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
        [ns.ex.property.value]: rdf.literal('2.2', ns.xsd.double),
      }, {
        [ns.ex.property.value]: max,
      }, {
        [ns.ex.property.value]: min,
      }],
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
        [ns.ex.property.value]: rdf.literal('2.2', ns.xsd.float),
      }, {
        [ns.ex.property.value]: max,
      }, {
        [ns.ex.property.value]: min,
      }],
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
        [ns.ex.property.value]: rdf.literal('2', ns.xsd.int),
      }, {
        [ns.ex.property.value]: max,
      }, {
        [ns.ex.property.value]: min,
      }],
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
        [ns.ex.property.value]: rdf.literal('0100', ns.xsd.gYear),
      }, {
        [ns.ex.property.value]: max,
      }, {
        [ns.ex.property.value]: min,
      }],
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
        [ns.ex.property.value]: rdf.literal('2', ns.xsd.integer),
      }, {
        [ns.ex.property.value]: max,
      }, {
        [ns.ex.property.value]: min,
      }],
    })
    const transform = buildCubeShape()

    input.pipe(transform)

    const result = await datasetStreamToClownface(transform)

    checkMinMax(result, min, max)
  })

  it('should generate sh:or for multiple datatypes', async () => {
    const input = createObservationsStream({
      observations: [{
        [ns.ex.property.value]: rdf.literal('a', ns.xsd.integer),
      }, {
        [ns.ex.property.value]: rdf.literal('', ns.cube.Undefined),
      }],
    })
    const transform = buildCubeShape()

    input.pipe(transform)

    const result = await datasetStreamToClownface(transform)

    const propertyShape = result.has(ns.sh.path, ns.ex.property)
    const datatypes = rdf.termSet([...propertyShape.out(ns.sh.or).list()].map(or => or.out(ns.sh.datatype).term))

    strictEqual(datatypes.has(ns.xsd.integer), true)
    strictEqual(datatypes.has(ns.cube.Undefined), true)
  })

  it('should merge given metadata to cube metadata', async () => {
    const metadata = toStream(rdf.dataset([
      rdf.quad(ns.ex.cube, ns.schema.name, rdf.literal('Test Cube')),
      rdf.quad(ns.ex.other, ns.schema.name, rdf.literal('Test Other')),
    ]))
    const input = createObservationsStream({
      observations: [{
        [ns.ex.property.value]: rdf.literal('test'),
      }],
    })
    const transform = buildCubeShape({ metadata })

    input.pipe(transform)

    const result = await datasetStreamToClownface(transform)

    const cubeName = result.out(ns.schema.name).term

    strictEqual(rdf.literal('Test Cube').equals(cubeName), true)
  })

  it('should ignore cube:observationConstraint property in cube metadata', async () => {
    const metadata = toStream(rdf.dataset([
      rdf.quad(ns.ex.cube, ns.cube.observationConstraint, ns.ex.shape),
    ]))
    const input = createObservationsStream({
      observations: [{
        [ns.ex.property.value]: rdf.literal('test'),
      }],
    })
    const transform = buildCubeShape({ metadata })

    input.pipe(transform)

    const result = await datasetStreamToClownface(transform)

    const constraints = result.out(ns.cube.observationConstraint).terms

    strictEqual(constraints.length, 1)
    strictEqual(constraints[0].equals(ns.ex.shape), false)
  })

  it('should merge given metadata with blank nodes to cube metadata', async () => {
    const dataset = rdf.dataset()

    rdf.clownface({ dataset, term: ns.ex.cube })
      .addOut(ns.ex.propertyA, null, ptr => {
        ptr
          .addOut(ns.ex.propertyB, 'Text B')
          .addOut(ns.ex.propertyC, null, ptr => {
            ptr.addOut(ns.ex.propertyD, 'Text D')
          })
          .addOut(ns.ex.propertyF, ns.ex.node, ptr => {
            ptr.addOut(ns.ex.propertyE, 'Text E')
          })
      })
      .addOut(ns.cube.observationConstraint, ns.ex.test)

    const input = createObservationsStream({
      observations: [{
        [ns.ex.property.value]: rdf.literal('test'),
      }],
    })
    const transform = buildCubeShape({ metadata: toStream(dataset) })

    input.pipe(transform)

    const result = await datasetStreamToClownface(transform)

    const propertyA = result.out(ns.ex.propertyA)
    const propertyB = propertyA.out(ns.ex.propertyB)
    const propertyC = propertyA.out(ns.ex.propertyC)
    const propertyD = propertyC.out(ns.ex.propertyD)
    const propertyF = propertyA.out(ns.ex.propertyF)
    const propertyG = propertyF.out(ns.ex.propertyG)

    strictEqual(propertyA.term.termType, 'BlankNode')
    strictEqual(rdf.literal('Text B').equals(propertyB.term), true)
    strictEqual(propertyC.term.termType, 'BlankNode')
    strictEqual(rdf.literal('Text D').equals(propertyD.term), true)
    strictEqual(ns.ex.node.equals(propertyF.term), true)
    strictEqual(propertyG.term, undefined)
  })

  it('should merge given metadata to dimension metadata', async () => {
    const dataset = rdf.dataset()

    rdf.clownface({ dataset, term: ns.ex.cube })
      .addOut(ns.cube.observationConstraint, shape => {
        shape.addOut(ns.sh.property, property => {
          property
            .addOut(ns.sh.path, ns.ex.property1)
            .addOut(ns.schema.name, 'Test Property')
        })
      })

    rdf.clownface({ dataset, term: ns.ex.otherCube })
      .addOut(ns.cube.observationConstraint, shape => {
        shape.addOut(ns.sh.property, property => {
          property
            .addOut(ns.sh.path, ns.ex.property1)
            .addOut(ns.schema.name, 'Other Property')
        })
      })

    const input = createObservationsStream({
      observations: [{
        [ns.ex.property1.value]: rdf.literal('A'),
        [ns.ex.property2.value]: rdf.literal('B'),
      }],
    })
    const transform = buildCubeShape({ metadata: toStream(dataset) })

    input.pipe(transform)

    const result = await datasetStreamToClownface(transform)

    const property1Name = result.has(ns.sh.path, ns.ex.property1)
      .out(ns.schema.name).term

    strictEqual(rdf.literal('Test Property').equals(property1Name), true)
  })

  it('should merge given metadata with blank nodes to dimension metadata', async () => {
    const dataset = rdf.dataset()

    rdf.clownface({ dataset, term: ns.ex.cube })
      .addOut(ns.cube.observationConstraint, shape => {
        shape.addOut(ns.sh.property, property => {
          property
            .addOut(ns.sh.path, ns.ex.property1)
            .addOut(ns.ex.propertyA, null, ptr => {
              ptr
                .addOut(ns.ex.propertyB, 'Text B')
                .addOut(ns.ex.propertyC, null, ptr => ptr.addOut(ns.ex.propertyD, 'Text D'))
                .addOut(ns.ex.propertyF, ns.ex.node, ptr => ptr.addOut(ns.ex.propertyE, 'Text E'))
            })
        })
      })

    const input = createObservationsStream({
      observations: [{
        [ns.ex.property1.value]: rdf.literal('A'),
        [ns.ex.property2.value]: rdf.literal('B'),
      }],
    })
    const transform = buildCubeShape({ metadata: toStream(dataset) })

    input.pipe(transform)

    const result = await datasetStreamToClownface(transform)

    const propertyA = result.has(ns.sh.path, ns.ex.property1).out(ns.ex.propertyA)
    const propertyB = propertyA.out(ns.ex.propertyB)
    const propertyC = propertyA.out(ns.ex.propertyC)
    const propertyD = propertyC.out(ns.ex.propertyD)
    const propertyF = propertyA.out(ns.ex.propertyF)
    const propertyG = propertyF.out(ns.ex.propertyG)

    strictEqual(propertyA.term.termType, 'BlankNode')
    strictEqual(rdf.literal('Text B').equals(propertyB.term), true)
    strictEqual(propertyC.term.termType, 'BlankNode')
    strictEqual(rdf.literal('Text D').equals(propertyD.term), true)
    strictEqual(ns.ex.node.equals(propertyF.term), true)
    strictEqual(propertyG.term, undefined)
  })

  it('should use the graph parameter as named-graph for the produced shapes', async () => {
    const dataset = rdf.dataset()

    const input = createObservationsStream({
      observations: [{
        [ns.ex.property1.value]: rdf.literal('A'),
        [ns.ex.property2.value]: rdf.literal('B'),
      }],
    })
    const targetShapeGraph = rdf.namedNode('http://shapes.org')
    const transform = buildCubeShape({ metadata: toStream(dataset), graph: targetShapeGraph })

    input.pipe(transform)

    const result = await datasetStreamToClownface(transform)
    for (const quad of [...result.dataset].slice(0, 8)) {
      strictEqual(targetShapeGraph.equals(quad.graph), false)
    }
    for (const quad of [...result.dataset].slice(8)) {
      strictEqual(targetShapeGraph.equals(quad.graph), true)
    }
  })

  it('should use the graph value as named-graph for the produced shapes, given as string', async () => {
    const dataset = rdf.dataset()

    const input = createObservationsStream({
      observations: [{
        [ns.ex.property1.value]: rdf.literal('A'),
        [ns.ex.property2.value]: rdf.literal('B'),
      }],
    })
    const targetShapeGraph = 'http://shapes.org'
    const transform = buildCubeShape({ metadata: toStream(dataset), graph: targetShapeGraph })

    input.pipe(transform)

    const result = await datasetStreamToClownface(transform)
    for (const quad of [...result.dataset].slice(0, 8)) {
      strictEqual(rdf.namedNode(targetShapeGraph).equals(quad.graph), false)
    }
    for (const quad of [...result.dataset].slice(8)) {
      strictEqual(rdf.namedNode(targetShapeGraph).equals(quad.graph), true)
    }
  })
})
