import rdf from '@zazuko/env'
import addAll from 'rdf-dataset-ext/addAll.js'
import cbdCopy from '../../cbdCopy.js'
import * as ns from '../../namespaces.js'
import Dimension from './Dimension.js'

class Cube {
  constructor({ metadata, observationSet, shape, term, propertyShapeId }) {
    this.metadata = metadata
    this.observationSet = observationSet
    this.shape = shape
    this.term = term
    this.dimensions = rdf.termMap()
    this.propertyShapeId = propertyShapeId
  }

  dimension({ predicate, object }) {
    let dimension = this.dimensions.get(predicate)

    if (!dimension) {
      const metadata = this.metadata
        .out(ns.cube.observationConstraint)
        .out(ns.sh.property)
        .has(ns.sh.path, predicate)

      dimension = new Dimension({ metadata, predicate, object, shapeId: this.propertyShapeId })

      this.dimensions.set(predicate, dimension)
    }

    return dimension
  }

  update({ predicate, object }) {
    this.dimension({ predicate, object }).update({ predicate, object })
  }

  toDataset({ shapeGraph } = { shapeGraph: undefined }) {
    const dataset = rdf.dataset()

    const cube = rdf.clownface({ dataset, term: this.term })
      .addOut(ns.rdf.type, ns.cube.Cube)
      .addOut(ns.cube.observationSet, this.observationSet)
      .addOut(ns.cube.observationConstraint, this.shape)

    cbdCopy(this.metadata, cube, { ignore: rdf.termSet([ns.cube.observationConstraint]) })

    rdf.clownface({ dataset, term: this.observationSet })
      .addOut(ns.rdf.type, ns.cube.ObservationSet)

    const shapeDataset = rdf.dataset()

    rdf.clownface({ dataset: shapeDataset, term: this.shape })
      .addOut(ns.rdf.type, [ns.sh.NodeShape, ns.cube.Constraint])
      .addOut(ns.sh.closed, true)

    for (const dimension of this.dimensions.values()) {
      addAll(shapeDataset, dimension.toDataset({ cube: this, shape: this.shape }))
    }
    const setGraph = quad => rdf.quad(quad.subject, quad.predicate, quad.object, shapeGraph)

    return addAll(dataset, [...shapeDataset].map(setGraph))
  }
}

export default Cube
