import cbdCopy from '../../cbdCopy.js'
import datatypeParsers from './datatypes.js'
import { CompositeConstraintBuilder, NodeKindConstraintBuilder, DimensionConstraintsBuilder } from './Constraints.js'

class Dimension {
  constructor({ rdf, metadata, predicate, shapeId = () => rdf.blankNode(), inListThreshold }) {
    this.rdf = rdf
    this.metadata = metadata
    this.predicate = predicate
    this.shapeId = shapeId
    this.constraints = new CompositeConstraintBuilder(
      new NodeKindConstraintBuilder(rdf),
      new DimensionConstraintsBuilder({ rdf, datatypeParsers: datatypeParsers(rdf), inListThreshold }))
    this.messages = []
  }

  update({ object }) {
    this.constraints.add(object)
  }

  toDataset({ cube, shape }) {
    const dataset = this.rdf.dataset()

    const graph = this.rdf.clownface({ dataset })
    const ptr = graph.node(this.shapeId(cube, this))

    ptr
      .addIn(this.rdf.ns.sh.property, shape)
      .addOut(this.rdf.ns.sh.path, this.predicate)
      .addOut(this.rdf.ns.sh.minCount, 1)
      .addOut(this.rdf.ns.sh.maxCount, 1)

    this.constraints.build(ptr)

    ptr.out(this.rdf.ns.sh.description)
      .forEach(description => {
        this.messages.push(`${this.predicate.value}: ${description.term.value}`)
      })

    if (this.metadata.term) {
      cbdCopy(this.rdf, this.metadata, ptr)
    }

    return dataset
  }
}

export default Dimension
