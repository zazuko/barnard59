import clownface from 'clownface'
import rdf from 'rdf-ext'
import TermMap from '@rdfjs/term-map'
import Dimension from './Dimension.js'
import * as ns from './namespaces.js'

class Cube {
  constructor ({ term, observationSet, shape }) {
    this.term = term
    this.observationSet = observationSet
    this.shape = shape
    this.dimensions = new TermMap()
  }

  dimension ({ predicate, object }) {
    let dimension = this.dimensions.get(predicate)

    if (!dimension) {
      dimension = new Dimension({ predicate, object })

      this.dimensions.set(predicate, dimension)
    }

    return dimension
  }

  update ({ predicate, object }) {
    this.dimension({ predicate, object }).update({ predicate, object })
  }

  toDataset () {
    const dataset = rdf.dataset()

    clownface({ dataset, term: this.term })
      .addOut(ns.rdf.type, ns.cube.Cube)
      .addOut(ns.cube.observationSet, this.observationSet)
      .addOut(ns.cube.observationConstraint, this.shape)

    clownface({ dataset, term: this.observationSet })
      .addOut(ns.rdf.type, ns.cube.ObservationSet)

    clownface({ dataset, term: this.shape })
      .addOut(ns.rdf.type, [ns.sh.NodeShape, ns.cube.Constraint])
      .addOut(ns.sh.closed, true)

    for (const dimension of this.dimensions.values()) {
      dataset.addAll(dimension.toDataset({ shape: this.shape }))
    }

    return dataset
  }
}

export default Cube
