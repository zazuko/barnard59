import { strictEqual } from 'assert'
import toNT from '@rdfjs/to-ntriples'
import { isDuplexStream as isDuplex } from 'is-stream'
import rdf from 'barnard59-env'
import { expect } from 'chai'
import buildCubeShapeUnbound from '../../lib/cube/buildCubeShape/index.js'
import createObservationsStream from '../support/createObservationsStream.js'
import datasetStreamToClownface from '../support/datasetStreamToClownface.js'
import { ex } from '../support/namespaces.js'

const ns = rdf.ns
const buildCubeShape = buildCubeShapeUnbound.bind({ env: rdf })

function checkMinMax(result, min, max) {
  const propertyShape = result.has(ns.sh.path, ex.property)
  checkRange(propertyShape, min, max)
}

function checkRange(ptr, min, max) {
  const shapeMin = ptr.out(ns.sh.minInclusive)
  const shapeMax = ptr.out(ns.sh.maxInclusive)

  strictEqual(toNT(shapeMin.term), toNT(min))
  strictEqual(toNT(shapeMax.term), toNT(max))
}

function checkValues(ptr, ...expectedValues) {
  const values = rdf.termSet([...ptr.out(ns.sh.in).list()].map(ptr => ptr.term))

  strictEqual(values.size, expectedValues.length)
  for (const expectedValue of expectedValues) {
    strictEqual(values.has(expectedValue), true)
  }
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
      .node(ex('cube'))
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
      .node(ex('cube/observation/'))
      .has(ns.rdf.type, ns.cube.ObservationSet)

    strictEqual(cube.terms.length, 1)
  })

  it('should point from the cube to the observation set', async () => {
    const input = createObservationsStream()
    const transform = buildCubeShape()

    input.pipe(transform)

    const result = await datasetStreamToClownface(transform)

    const observationSet = result
      .node(ex('cube'))
      .has(ns.cube.observationSet, ex('cube/observation/'))

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
      .node(ex('cube/shape'))
      .has(ns.rdf.type, ns.sh.NodeShape)

    strictEqual(shape.terms.length, 1)
  })

  it('should point from the cube to the shape', async () => {
    const input = createObservationsStream()
    const transform = buildCubeShape()

    input.pipe(transform)

    const result = await datasetStreamToClownface(transform)

    const cube = result
      .node(ex('cube'))
      .has(ns.cube.observationConstraint, ex('cube/shape'))

    strictEqual(cube.terms.length, 1)
  })

  it('should generate a property shape for each dimension', async () => {
    const input = createObservationsStream({
      observations: [{
        [ex.propertyA.value]: rdf.literal('A'),
        [ex.propertyB.value]: rdf.literal('B'),
      }],
    })
    const transform = buildCubeShape()

    input.pipe(transform)

    const result = await datasetStreamToClownface(transform)

    const propertyShapes = result.node(ex('cube/shape')).out(ns.sh.property)
    const pathes = rdf.termSet(propertyShapes.out(ns.sh.path).terms)

    strictEqual(propertyShapes.terms.length, 3)
    strictEqual(pathes.has(ns.rdf.type), true)
    strictEqual(pathes.has(ex.propertyA), true)
    strictEqual(pathes.has(ex.propertyB), true)
  })

  it('should generate a NamedNode property shape for each dimension', async () => {
    const input = createObservationsStream({
      observations: [{
        [ex.propertyA.value]: rdf.literal('A'),
        [ex.propertyB.value]: rdf.literal('B'),
      }],
    })
    const transform = buildCubeShape({
      propertyShapeId(cube, dimension) {
        return rdf.namedNode(`${cube.term.value}/dim?id=${dimension.predicate.value}`)
      },
    })

    input.pipe(transform)

    const result = await datasetStreamToClownface(transform)

    const propertyShapes = result.node(ex('cube/shape')).out(ns.sh.property)

    expect(propertyShapes.terms).to.deep.contain.all.members([
      rdf.namedNode('http://example.org/cube/dim?id=http://www.w3.org/1999/02/22-rdf-syntax-ns#type'),
      rdf.namedNode('http://example.org/cube/dim?id=http://example.org/propertyA'),
      rdf.namedNode('http://example.org/cube/dim?id=http://example.org/propertyB'),
    ])
  })

  it('should generate nodeKind for literal values', async () => {
    const input = createObservationsStream({
      observations: [{
        [ex.property.value]: rdf.literal('A'),
      }, {
        [ex.property.value]: rdf.literal('B'),
      }],
    })
    const transform = buildCubeShape()

    input.pipe(transform)

    const result = await datasetStreamToClownface(transform)

    const propertyShape = result.has(ns.sh.path, ex.property)
    const nodeKind = propertyShape.out(ns.sh.nodeKind)

    strictEqual(toNT(nodeKind.term), toNT(ns.sh.Literal))
  })

  it('should generate nodeKind for named node values', async () => {
    const input = createObservationsStream({
      observations: [{
        [ex.property.value]: ex.valueA,
      }, {
        [ex.property.value]: ex.valueB,
      }],
    })
    const transform = buildCubeShape()

    input.pipe(transform)

    const result = await datasetStreamToClownface(transform)

    const propertyShape = result.has(ns.sh.path, ex.property)
    const nodeKind = propertyShape.out(ns.sh.nodeKind)

    strictEqual(toNT(nodeKind.term), toNT(ns.sh.IRI))
  })

  it('should generate nodeKind for mixed node values', async () => {
    const input = createObservationsStream({
      observations: [{
        [ex.property.value]: rdf.literal('A'),
      }, {
        [ex.property.value]: ex.valueB,
      }],
    })
    const transform = buildCubeShape()

    input.pipe(transform)

    const result = await datasetStreamToClownface(transform)

    const propertyShape = result.has(ns.sh.path, ex.property)
    const nodeKind = propertyShape.out(ns.sh.nodeKind)

    strictEqual(toNT(nodeKind.term), toNT(ns.sh.IRIOrLiteral))
  })

  it('should generate a sh:in list for plain string values', async () => {
    const input = createObservationsStream({
      observations: [{
        [ex.property.value]: rdf.literal('A'),
      }, {
        [ex.property.value]: rdf.literal('B'),
      }],
    })
    const transform = buildCubeShape()

    input.pipe(transform)

    const result = await datasetStreamToClownface(transform)

    const propertyShape = result.has(ns.sh.path, ex.property)
    checkValues(propertyShape, rdf.literal('A'), rdf.literal('B'))
  })

  it('should generate a sh:in list for literal values without a parser', async () => {
    const literalA = rdf.literal('A', ns.xsd.fake)
    const literalB = rdf.literal('B', ns.xsd.fake)
    const input = createObservationsStream({
      observations: [{
        [ex.property.value]: literalA,
      }, {
        [ex.property.value]: literalB,
      }],
    })
    const transform = buildCubeShape()

    input.pipe(transform)

    const result = await datasetStreamToClownface(transform)

    const propertyShape = result.has(ns.sh.path, ex.property)
    checkValues(propertyShape, literalA, literalB)
  })

  it('should generate a sh:in list for named node values', async () => {
    const input = createObservationsStream({
      observations: [{
        [ex.property.value]: ex.valueA,
      }, {
        [ex.property.value]: ex.valueB,
      }],
    })
    const transform = buildCubeShape()

    input.pipe(transform)

    const result = await datasetStreamToClownface(transform)

    const propertyShape = result.has(ns.sh.path, ex.property)
    checkValues(propertyShape, ex.valueA, ex.valueB)
  })

  it('should generate sh:minInclusive an sh:maxInclusive properties for date values', async () => {
    const min = rdf.literal('2000-01-01T00:00:00.000Z', ns.xsd.date)
    const max = rdf.literal('2000-01-03T00:00:00.000Z', ns.xsd.date)
    const input = createObservationsStream({
      observations: [{
        [ex.property.value]: rdf.literal('2000-01-02T00:00:00.000Z', ns.xsd.date),
      }, {
        [ex.property.value]: max,
      }, {
        [ex.property.value]: min,
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
        [ex.property.value]: rdf.literal('2.2', ns.xsd.double),
      }, {
        [ex.property.value]: max,
      }, {
        [ex.property.value]: min,
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
        [ex.property.value]: rdf.literal('2.2', ns.xsd.float),
      }, {
        [ex.property.value]: max,
      }, {
        [ex.property.value]: min,
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
        [ex.property.value]: rdf.literal('2', ns.xsd.int),
      }, {
        [ex.property.value]: max,
      }, {
        [ex.property.value]: min,
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
        [ex.property.value]: rdf.literal('0100', ns.xsd.gYear),
      }, {
        [ex.property.value]: max,
      }, {
        [ex.property.value]: min,
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
        [ex.property.value]: rdf.literal('2', ns.xsd.integer),
      }, {
        [ex.property.value]: max,
      }, {
        [ex.property.value]: min,
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
        [ex.property.value]: rdf.literal('a', ns.xsd.integer),
      }, {
        [ex.property.value]: rdf.literal('', ns.cube.Undefined),
      }],
    })
    const transform = buildCubeShape()

    input.pipe(transform)

    const result = await datasetStreamToClownface(transform)

    const propertyShape = result.has(ns.sh.path, ex.property)
    const datatypes = rdf.termSet([...propertyShape.out(ns.sh.or).list()].map(or => or.out(ns.sh.datatype).term))

    strictEqual(datatypes.has(ns.xsd.integer), true)
    strictEqual(datatypes.has(ns.cube.Undefined), true)
  })

  it('should limit number of values in sh:in', async () => {
    const input = createObservationsStream({
      observations: [{
        [ex.property.value]: ex.valueA,
      }, {
        [ex.property.value]: ex.valueB,
      }],
    })
    const transform = buildCubeShape({ inListMaxSize: 1 })

    input.pipe(transform)

    const result = await datasetStreamToClownface(transform)

    const propertyShape = result.has(ns.sh.path, ex.property)
    strictEqual(propertyShape.out(ns.sh.in).terms.length, 0)
    const message = propertyShape.out(ns.sh.description).term.value
    strictEqual(message, 'Too many values for in-list constraint.')
  })

  it('should place other constraints inside sh:or if there are multiple datatypes', async () => {
    const two = rdf.literal('2', ns.xsd.integer)
    const five = rdf.literal('5', ns.xsd.integer)
    const undefinedValue = rdf.literal('', ns.cube.Undefined)

    const input = createObservationsStream({
      observations: [{
        [ex.property.value]: five,
      }, {
        [ex.property.value]: two,
      }, {
        [ex.property.value]: undefinedValue,
      }],
    })
    const transform = buildCubeShape()

    input.pipe(transform)

    const result = await datasetStreamToClownface(transform)

    const propertyShape = result.has(ns.sh.path, ex.property)
    const disjuncts = [...propertyShape.out(ns.sh.or).list()]
    const integer = disjuncts.find(x => x.out(ns.sh.datatype).term.equals(ns.xsd.integer))
    const undefinedType = disjuncts.find(x => x.out(ns.sh.datatype).term.equals(ns.cube.Undefined))
    checkRange(integer, two, five)
    checkValues(undefinedType, undefinedValue)
  })

  it('should create no range constraints on parsing error', async () => {
    const two = rdf.literal('2', ns.xsd.integer)
    const five = rdf.literal('5', ns.xsd.integer)
    const input = createObservationsStream({
      observations: [{
        [ex.property.value]: two,
      }, {
        [ex.property.value]: rdf.literal('googol', ns.xsd.integer),
      }, {
        [ex.property.value]: five,
      }],
    })
    const transform = buildCubeShape()

    input.pipe(transform)

    const result = await datasetStreamToClownface(transform)

    strictEqual(result.out(ns.sh.minInclusive).terms.length, 0)
    strictEqual(result.out(ns.sh.maxInclusive).terms.length, 0)
  })

  it('should merge given metadata to cube metadata', async () => {
    const metadata = rdf.dataset([
      rdf.quad(ex.cube, ns.schema.name, rdf.literal('Test Cube')),
      rdf.quad(ex.other, ns.schema.name, rdf.literal('Test Other')),
    ]).toStream()
    const input = createObservationsStream({
      observations: [{
        [ex.property.value]: rdf.literal('test'),
      }],
    })
    const transform = buildCubeShape({ metadata })

    input.pipe(transform)

    const result = await datasetStreamToClownface(transform)

    const cubeName = result.out(ns.schema.name).term

    strictEqual(rdf.literal('Test Cube').equals(cubeName), true)
  })

  it('should ignore cube:observationConstraint property in cube metadata', async () => {
    const metadata = rdf.dataset([
      rdf.quad(ex.cube, ns.cube.observationConstraint, ex.shape),
    ]).toStream()
    const input = createObservationsStream({
      observations: [{
        [ex.property.value]: rdf.literal('test'),
      }],
    })
    const transform = buildCubeShape({ metadata })

    input.pipe(transform)

    const result = await datasetStreamToClownface(transform)

    const constraints = result.out(ns.cube.observationConstraint).terms

    strictEqual(constraints.length, 1)
    strictEqual(constraints[0].equals(ex.shape), false)
  })

  it('should merge given metadata with blank nodes to cube metadata', async () => {
    const dataset = rdf.dataset()

    rdf.clownface({ dataset, term: ex.cube })
      .addOut(ex.propertyA, null, ptr => {
        ptr
          .addOut(ex.propertyB, 'Text B')
          .addOut(ex.propertyC, null, ptr => {
            ptr.addOut(ex.propertyD, 'Text D')
          })
          .addOut(ex.propertyF, ex.node, ptr => {
            ptr.addOut(ex.propertyE, 'Text E')
          })
      })
      .addOut(ns.cube.observationConstraint, ex.test)

    const input = createObservationsStream({
      observations: [{
        [ex.property.value]: rdf.literal('test'),
      }],
    })
    const transform = buildCubeShape({ metadata: dataset.toStream() })

    input.pipe(transform)

    const result = await datasetStreamToClownface(transform)

    const propertyA = result.out(ex.propertyA)
    const propertyB = propertyA.out(ex.propertyB)
    const propertyC = propertyA.out(ex.propertyC)
    const propertyD = propertyC.out(ex.propertyD)
    const propertyF = propertyA.out(ex.propertyF)
    const propertyG = propertyF.out(ex.propertyG)

    strictEqual(propertyA.term.termType, 'BlankNode')
    strictEqual(rdf.literal('Text B').equals(propertyB.term), true)
    strictEqual(propertyC.term.termType, 'BlankNode')
    strictEqual(rdf.literal('Text D').equals(propertyD.term), true)
    strictEqual(ex.node.equals(propertyF.term), true)
    strictEqual(propertyG.term, undefined)
  })

  it('should merge given metadata to dimension metadata', async () => {
    const dataset = rdf.dataset()

    rdf.clownface({ dataset, term: ex.cube })
      .addOut(ns.cube.observationConstraint, shape => {
        shape.addOut(ns.sh.property, property => {
          property
            .addOut(ns.sh.path, ex.property1)
            .addOut(ns.schema.name, 'Test Property')
        })
      })

    rdf.clownface({ dataset, term: ex.otherCube })
      .addOut(ns.cube.observationConstraint, shape => {
        shape.addOut(ns.sh.property, property => {
          property
            .addOut(ns.sh.path, ex.property1)
            .addOut(ns.schema.name, 'Other Property')
        })
      })

    const input = createObservationsStream({
      observations: [{
        [ex.property1.value]: rdf.literal('A'),
        [ex.property2.value]: rdf.literal('B'),
      }],
    })
    const transform = buildCubeShape({ metadata: dataset.toStream() })

    input.pipe(transform)

    const result = await datasetStreamToClownface(transform)

    const property1Name = result.has(ns.sh.path, ex.property1)
      .out(ns.schema.name).term

    strictEqual(rdf.literal('Test Property').equals(property1Name), true)
  })

  it('should merge given metadata with blank nodes to dimension metadata', async () => {
    const dataset = rdf.dataset()

    rdf.clownface({ dataset, term: ex.cube })
      .addOut(ns.cube.observationConstraint, shape => {
        shape.addOut(ns.sh.property, property => {
          property
            .addOut(ns.sh.path, ex.property1)
            .addOut(ex.propertyA, null, ptr => {
              ptr
                .addOut(ex.propertyB, 'Text B')
                .addOut(ex.propertyC, null, ptr => ptr.addOut(ex.propertyD, 'Text D'))
                .addOut(ex.propertyF, ex.node, ptr => ptr.addOut(ex.propertyE, 'Text E'))
            })
        })
      })

    const input = createObservationsStream({
      observations: [{
        [ex.property1.value]: rdf.literal('A'),
        [ex.property2.value]: rdf.literal('B'),
      }],
    })
    const transform = buildCubeShape({ metadata: dataset.toStream() })

    input.pipe(transform)

    const result = await datasetStreamToClownface(transform)

    const propertyA = result.has(ns.sh.path, ex.property1).out(ex.propertyA)
    const propertyB = propertyA.out(ex.propertyB)
    const propertyC = propertyA.out(ex.propertyC)
    const propertyD = propertyC.out(ex.propertyD)
    const propertyF = propertyA.out(ex.propertyF)
    const propertyG = propertyF.out(ex.propertyG)

    strictEqual(propertyA.term.termType, 'BlankNode')
    strictEqual(rdf.literal('Text B').equals(propertyB.term), true)
    strictEqual(propertyC.term.termType, 'BlankNode')
    strictEqual(rdf.literal('Text D').equals(propertyD.term), true)
    strictEqual(ex.node.equals(propertyF.term), true)
    strictEqual(propertyG.term, undefined)
  })

  it('should use the graph parameter as named-graph for the produced shapes', async () => {
    const dataset = rdf.dataset()

    const input = createObservationsStream({
      observations: [{
        [ex.property1.value]: rdf.literal('A'),
        [ex.property2.value]: rdf.literal('B'),
      }],
    })
    const targetShapeGraph = rdf.namedNode('http://shapes.org')
    const transform = buildCubeShape({ metadata: dataset.toStream(), graph: targetShapeGraph })

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
        [ex.property1.value]: rdf.literal('A'),
        [ex.property2.value]: rdf.literal('B'),
      }],
    })
    const targetShapeGraph = 'http://shapes.org'
    const transform = buildCubeShape({ metadata: dataset.toStream(), graph: targetShapeGraph })

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
