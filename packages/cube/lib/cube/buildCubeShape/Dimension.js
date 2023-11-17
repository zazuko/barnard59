import cbdCopy from '../../cbdCopy.js'
import initDatatypeParsers from './datatypes.js'

class Dimension {
  constructor({ rdf, metadata, predicate, object, shapeId = () => rdf.blankNode() }) {
    this.rdf = rdf
    this.metadata = metadata
    this.predicate = predicate
    this.termType = object.termType
    this.datatype = rdf.termSet()
    this.shapeId = shapeId

    this.datatypeParsers = initDatatypeParsers(rdf)
    if (object.datatype && this.datatypeParsers.has(object.datatype)) {
      const datatypeParser = this.datatypeParsers.get(object.datatype)

      const value = datatypeParser(object)

      this.min = object
      this.minValue = value
      this.max = object
      this.maxValue = value
    } else {
      this.in = rdf.termSet()
    }
  }

  update({ object }) {
    if (object.datatype) {
      this.datatype.add(object.datatype)
    }

    if (object.datatype && this.datatypeParsers.has(object.datatype)) {
      const datatypeParser = this.datatypeParsers.get(object.datatype)

      const value = datatypeParser(object)

      if (value < this.minValue) {
        this.min = object
        this.minValue = value
      }

      if (value > this.maxValue) {
        this.max = object
        this.maxValue = value
      }
    }

    if (this.in) {
      this.in.add(object)
    }
  }

  toDataset({ cube, shape }) {
    const dataset = this.rdf.dataset()

    const graph = this.rdf.clownface({ dataset })
    const ptr = graph.node(this.shapeId(cube, this))

    ptr
      .addIn(this.rdf.ns.sh.property, shape)
      .addOut(this.rdf.ns.sh.path, this.predicate)
      .addOut(this.rdf.ns.sh.nodeKind, this.termType === 'NamedNode' ? this.rdf.ns.sh.IRI : this.rdf.ns.sh.Literal)
      .addOut(this.rdf.ns.sh.minCount, 1)
      .addOut(this.rdf.ns.sh.maxCount, 1)

    if (this.datatype.size === 1) {
      ptr.addOut(this.rdf.ns.sh.datatype, [...this.datatype][0])
    }

    if (this.datatype.size > 1) {
      ptr.addList(this.rdf.ns.sh.or, [...this.datatype].map(datatype => {
        return ptr
          .blankNode()
          .addOut(this.rdf.ns.sh.datatype, datatype)
      }))
    }

    if (this.in) {
      ptr.addList(this.rdf.ns.sh.in, [...this.in.values()])
    }

    if (this.min) {
      ptr.addOut(this.rdf.ns.sh.minInclusive, this.min)
    }

    if (this.max) {
      ptr.addOut(this.rdf.ns.sh.maxInclusive, this.max)
    }

    if (this.metadata.term) {
      cbdCopy(this.rdf, this.metadata, ptr)
    }

    return dataset
  }
}

export default Dimension
