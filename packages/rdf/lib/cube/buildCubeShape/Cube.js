import TermMap from '@rdfjs/term-map'
import clownface from 'clownface'
import rdf from 'rdf-ext'
import Dimension from './Dimension.js'
import * as ns from './namespaces.js'

class Cube {
  constructor ({ metadata, observationSet, shape, term }) {
    this.metadata = metadata
    this.observationSet = observationSet
    this.shape = shape
    this.term = term
    this.dimensions = new TermMap()
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

  toDataset () {
    const dataset = rdf.dataset()

    clownface({ dataset, term: this.term })
      .addOut(ns.rdf.type, ns.cube.Cube)
      .addOut(ns.cube.observationSet, this.observationSet)
      .addOut(ns.cube.observationConstraint, this.shape)

    const metadata = this.metadata.dataset
      .match(this.term)
      .filter(quad => !quad.predicate.equals(ns.cube.observationConstraint))

    dataset.addAll(metadata)

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
