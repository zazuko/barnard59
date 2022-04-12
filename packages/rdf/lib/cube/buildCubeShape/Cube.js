import TermMap from '@rdfjs/term-map'
import TermSet from '@rdfjs/term-set'
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

    const cube = clownface({ dataset, term: this.term })
      .addOut(ns.rdf.type, ns.cube.Cube)
      .addOut(ns.cube.observationSet, this.observationSet)
      .addOut(ns.cube.observationConstraint, this.shape)

    cbdCopy(this.metadata, cube, { ignore: new TermSet([ns.cube.observationConstraint]) })

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
