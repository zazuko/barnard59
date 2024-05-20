import { DatatypeConstraintBuilder } from './DatatypeConstraintBuilder.js'
import { CompositeConstraintBuilder } from './CompositeConstraintBuilder.js'
import { RangeConstraintBuilder } from './RangeConstraintBuilder.js'
import { ValuesConstraintBuilder } from './ValuesConstraintBuilder.js'
import { NodeKindConstraintBuilder } from './NodeKindConstraintBuilder.js'

const hasValuesBuilder = compositeBuilder =>
  compositeBuilder.builders.some(builder => builder instanceof ValuesConstraintBuilder && builder.enabled)

const getValuesBuilder = compositeBuilder =>
  compositeBuilder.builders.find(builder => builder instanceof ValuesConstraintBuilder)

export class DimensionConstraintsBuilder {
  constructor({ rdf, datatypeParsers, inListMaxSize }) {
    this.rdf = rdf
    this.datatypeParsers = datatypeParsers
    this.inListMaxSize = inListMaxSize
    this.builders = rdf.termMap()
  }

  #createBuilder(datatype) {
    if (this.datatypeParsers.has(datatype)) {
      return new CompositeConstraintBuilder(
        new DatatypeConstraintBuilder(this.rdf, datatype),
        new RangeConstraintBuilder(this.rdf, this.datatypeParsers.get(datatype)))
    } else {
      return new CompositeConstraintBuilder(
        new DatatypeConstraintBuilder(this.rdf, datatype),
        new ValuesConstraintBuilder(this.rdf, this.inListMaxSize))
    }
  }

  #addDatatype(object) {
    if (this.builders.has(object.datatype)) {
      this.builders.get(object.datatype).add(object)
    } else {
      const builder = this.#createBuilder(object.datatype)
      builder.add(object)
      this.builders.set(object.datatype, builder)
    }
  }

  #addOther(object) {
    if (this.valuesBuilder) {
      this.valuesBuilder.add(object)
    } else {
      this.valuesBuilder = new CompositeConstraintBuilder(
        new ValuesConstraintBuilder(this.rdf, this.inListMaxSize),
        new NodeKindConstraintBuilder(this.rdf))
      this.valuesBuilder.add(object)
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
    const builders = [...this.builders.values()]
    if (this.valuesBuilder) {
      builders.push(this.valuesBuilder)
    }

    if (builders.length === 1) {
      builders[0].build(ptr)
    }
    if (builders.length > 1) {
      // if all builders have sh:in, then merge them
      if (builders.every(hasValuesBuilder)) {
        const merged = new ValuesConstraintBuilder(this.rdf)
        for (const compositeBuilder of builders) {
          const valuesBuilder = getValuesBuilder(compositeBuilder)
          valuesBuilder.enabled = false
          valuesBuilder.values.forEach(value => merged.add(value))
        }
        merged.build(ptr)
      }

      ptr.addList(this.rdf.ns.sh.or, builders.map(builder => {
        const blankNode = ptr.blankNode()
        builder.build(blankNode)
        return blankNode
      }))
    }
  }
}
