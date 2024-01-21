import cbdCopy from '../../cbdCopy.js'
import Dimension from './Dimension.js'

class Cube {
  constructor({ rdf, metadata, observationSet, shape, term, propertyShapeId, inListMaxSize }) {
    this.rdf = rdf
    this.metadata = metadata
    this.observationSet = observationSet
    this.shape = shape
    this.term = term
    this.dimensions = rdf.termMap()
    this.propertyShapeId = propertyShapeId
    this.inListMaxSize = inListMaxSize
  }

  get messages() {
    return [...this.dimensions.values()].flatMap(({ messages }) => messages)
  }

  dimension({ predicate, object }) {
    let dimension = this.dimensions.get(predicate)

    if (!dimension) {
      const metadata = this.metadata
        .out(this.rdf.ns.cube.observationConstraint)
        .out(this.rdf.ns.sh.property)
        .has(this.rdf.ns.sh.path, predicate)

      dimension = new Dimension({ rdf: this.rdf, metadata, predicate, object, shapeId: this.propertyShapeId, inListMaxSize: this.inListMaxSize })

      this.dimensions.set(predicate, dimension)
    }

    return dimension
  }

  update({ predicate, object }) {
    this.dimension({ predicate, object }).update({ predicate, object })
  }

  toDataset({ shapeGraph } = { shapeGraph: undefined }) {
    const dataset = this.rdf.dataset()

    const cube = this.rdf.clownface({ dataset, term: this.term })
      .addOut(this.rdf.ns.rdf.type, this.rdf.ns.cube.Cube)
      .addOut(this.rdf.ns.cube.observationSet, this.observationSet)
      .addOut(this.rdf.ns.cube.observationConstraint, this.shape)

    cbdCopy(this.rdf, this.metadata, cube, { ignore: this.rdf.termSet([this.rdf.ns.cube.observationConstraint]) })

    this.rdf.clownface({ dataset, term: this.observationSet })
      .addOut(this.rdf.ns.rdf.type, this.rdf.ns.cube.ObservationSet)

    const shapeDataset = this.rdf.dataset()

    this.rdf.clownface({ dataset: shapeDataset, term: this.shape })
      .addOut(this.rdf.ns.rdf.type, [this.rdf.ns.sh.NodeShape, this.rdf.ns.cube.Constraint])
      .addOut(this.rdf.ns.sh.closed, true)

    for (const dimension of this.dimensions.values()) {
      shapeDataset.addAll(dimension.toDataset({ cube: this, shape: this.shape }))
    }
    const setGraph = quad => this.rdf.quad(quad.subject, quad.predicate, quad.object, shapeGraph)

    return dataset.addAll([...shapeDataset].map(setGraph))
  }
}

export default Cube
