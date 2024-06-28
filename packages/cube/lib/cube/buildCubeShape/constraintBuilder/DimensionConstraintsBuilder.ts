import type { Term, NamedNode } from '@rdfjs/types'
import type { Environment } from 'barnard59-env'
import type { GraphPointer } from 'clownface'
import type { DatatypeParser } from '../datatypes.js'
import { DatatypeConstraintBuilder } from './DatatypeConstraintBuilder.js'
import { type Builder, CompositeConstraintBuilder } from './CompositeConstraintBuilder.js'
import { RangeConstraintBuilder } from './RangeConstraintBuilder.js'
import { ValuesConstraintBuilder } from './ValuesConstraintBuilder.js'
import { NodeKindConstraintBuilder } from './NodeKindConstraintBuilder.js'

const getValuesBuilder = (compositeBuilder: CompositeConstraintBuilder) =>
  compositeBuilder.builders.find((builder): builder is ValuesConstraintBuilder => builder instanceof ValuesConstraintBuilder)

export class DimensionConstraintsBuilder implements Builder {
  declare rdf: Environment
  declare datatypeParsers: Map<NamedNode, DatatypeParser>
  declare inListMaxSize: number | undefined
  declare builders: Map<NamedNode, CompositeConstraintBuilder>
  declare valuesBuilder: CompositeConstraintBuilder | undefined

  constructor({ rdf, datatypeParsers, inListMaxSize }: { rdf: Environment; datatypeParsers: Map<NamedNode, DatatypeParser>; inListMaxSize?: number}) {
    this.rdf = rdf
    this.datatypeParsers = datatypeParsers
    this.inListMaxSize = inListMaxSize
    this.builders = rdf.termMap()
  }

  #createBuilder(datatype: NamedNode) {
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

  #addDatatype(object: Term) {
    if (!('datatype' in object)) return

    const builder = this.builders.get(object.datatype)
    if (builder) {
      builder.add(object)
    } else {
      const builder = this.#createBuilder(object.datatype)
      builder.add(object)
      this.builders.set(object.datatype, builder)
    }
  }

  #addOther(object: Term) {
    if (this.valuesBuilder) {
      this.valuesBuilder.add(object)
    } else {
      this.valuesBuilder = new CompositeConstraintBuilder(
        new ValuesConstraintBuilder(this.rdf, this.inListMaxSize),
        new NodeKindConstraintBuilder(this.rdf))
      this.valuesBuilder.add(object)
    }
  }

  add(object: Term) {
    if ('datatype' in object) {
      this.#addDatatype(object)
    } else {
      this.#addOther(object)
    }
  }

  build(ptr: GraphPointer) {
    const builders = [...this.builders.values()]
    if (this.valuesBuilder) {
      builders.push(this.valuesBuilder)
    }

    if (builders.length === 1) {
      builders[0].build(ptr)
    }
    if (builders.length > 1) {
      // if all builders have sh:in, then merge them
      const valuesBuilders = builders.map(getValuesBuilder).filter(Boolean) as ValuesConstraintBuilder[]
      if (valuesBuilders.length === builders.length && valuesBuilders.every(builder => builder.enabled)) {
        const merged = new ValuesConstraintBuilder(this.rdf)
        const allValues = valuesBuilders.flatMap(builder => Array.from(builder.values))
        allValues.forEach(value => merged.add(value))
        valuesBuilders.forEach(builder => { builder.enabled = false })
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
