import { DatatypeConstraintBuilder } from './DatatypeConstraintBuilder.js'
import { CompositeConstraintBuilder } from './CompositeConstraintBuilder.js'
import { RangeConstraintBuilder } from './RangeConstraintBuilder.js'
import { ValuesConstraintBuilder } from './ValuesConstraintBuilder.js'

export class DimensionConstraintsBuilder {
  constructor({ rdf, datatypeParsers, inListThreshold }) {
    this.rdf = rdf
    this.datatypeParsers = datatypeParsers
    this.inListThreshold = inListThreshold
    this.builders = rdf.termMap()
  }

  #addDatatype(object) {
    if (this.builders.has(object.datatype)) {
      this.builders.get(object.datatype).add(object)
    } else if (this.datatypeParsers.has(object.datatype)) {
      this.builders.set(object.datatype, new CompositeConstraintBuilder(
        new DatatypeConstraintBuilder(this.rdf, object.datatype),
        new RangeConstraintBuilder(this.rdf, object, this.datatypeParsers.get(object.datatype))))
    } else {
      this.builders.set(object.datatype, new CompositeConstraintBuilder(
        new DatatypeConstraintBuilder(this.rdf, object.datatype),
        new ValuesConstraintBuilder(this.rdf, object, this.inListThreshold)))
    }
  }

  #addOther(object) {
    if (this.valuesBuilder) {
      this.valuesBuilder.add(object)
    } else {
      this.valuesBuilder = new ValuesConstraintBuilder(this.rdf, object, this.inListThreshold)
    }
  }

  add(object) {
    if (object.datatype) {
      this.#addDatatype(object)
    } else {
      this.#addOther(object)
    }
  }

  build(ptr) {
    if (this.valuesBuilder?.message) {
      ptr.addOut(this.rdf.ns.sh.description, this.valuesBuilder.message)
      return
    }

    const builders = [...this.builders.values()]
    if (this.valuesBuilder) {
      builders.push(this.valuesBuilder)
    }

    if (builders.length === 1) {
      builders[0].build(ptr)
    }
    if (builders.length > 1) {
      ptr.addList(this.rdf.ns.sh.or, builders.map(builder => {
        const blankNode = ptr.blankNode()
        builder.build(blankNode)
        return blankNode
      }))
    }
  }
}
