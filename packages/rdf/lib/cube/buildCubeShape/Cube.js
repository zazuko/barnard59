import clownface from 'clownface'
import rdf from 'rdf-ext'
import cbdCopy from '../../cbdCopy.js'
import * as ns from '../../namespaces.js'
import Dimension from './Dimension.js'

class Cube {
  constructor ({ metadata, observationSet, shape, term }) {
    this.metadata = metadata
    this.observationSet = observationSet
    this.shape = shape
    this.term = term
    this.dimensions = rdf.termMap()
  }

  dimension ({ predicate, object }) {
    let dimension = this.dimensions.get(predicate)

    if (!dimension) {
      const metadata = this.metadata
        .out(ns.cube.observationConstraint)
        .out(ns.sh.property)
        .has(ns.sh.path, predicate)

      dimension = new Dimension({ metadata, predicate, object })

      this.dimensions.set(predicate, dimension)
    }

    return dimension
  }

  update ({ predicate, object }) {
    this.dimension({ predicate, object }).update({ predicate, object })
  }

  toDataset ({ shapeGraph } = { shapeGraph: undefined }) {
    const dataset = rdf.dataset()

    const cube = clownface({ dataset, term: this.term })
      .addOut(ns.rdf.type, ns.cube.Cube)
      .addOut(ns.cube.observationSet, this.observationSet)
      .addOut(ns.cube.observationConstraint, this.shape)

    cbdCopy(this.metadata, cube, { ignore: rdf.termSet([ns.cube.observationConstraint]) })

    clownface({ dataset, term: this.observationSet })
      .addOut(ns.rdf.type, ns.cube.ObservationSet)

    const shapeDataset = rdf.dataset()

    clownface({ dataset: shapeDataset, term: this.shape })
      .addOut(ns.rdf.type, [ns.sh.NodeShape, ns.cube.Constraint])
      .addOut(ns.sh.closed, true)

    for (const dimension of this.dimensions.values()) {
      shapeDataset.addAll(dimension.toDataset({ shape: this.shape }))
    }
    const setGraph = quad => rdf.quad(quad.subject, quad.predicate, quad.object, shapeGraph)

    return dataset.addAll([...(shapeDataset.map(setGraph))])
  }
}

export default Cube
