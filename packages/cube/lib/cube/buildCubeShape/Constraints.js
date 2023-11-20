export class CompositeConstraintBuilder {
  constructor(...builders) {
    this.builders = builders
  }

  add(object) {
    this.builders.forEach(builder => builder.add(object))
  }

  build(ptr) {
    this.builders.forEach(builder => builder.build(ptr))
  }
}

export class NodeKindConstraintBuilder {
  #termTypes = new Set()

  constructor(rdf) {
    this.sh = rdf.ns.sh
  }

  add(object) {
    this.#termTypes.add(object.termType)
  }

  get #nodeKind() {
    if (this.#termTypes.size === 1) {
      if (this.#termTypes.has('NamedNode')) {
        return this.sh.IRI
      }
      if (this.#termTypes.has('Literal')) {
        return this.sh.Literal
      }
      if (this.#termTypes.has('BlankNode')) {
        return this.sh.BlankNode
      }
    }
    if (this.#termTypes.size === 2) {
      if (this.#termTypes.has('NamedNode') && this.#termTypes.has('Literal')) {
        return this.sh.IRIOrLiteral
      }
      if (this.#termTypes.has('NamedNode') && this.#termTypes.has('BlankNode')) {
        return this.sh.BlankNodeOrIRI
      }
      if (this.#termTypes.has('Literal') && this.#termTypes.has('BlankNode')) {
        return this.sh.BlankNodeOrLiteral
      }
    }
  }

  build(ptr) {
    if (this.#nodeKind !== undefined) {
      ptr.addOut(this.sh.nodeKind, this.#nodeKind)
    }
  }
}

export class DatatypeConstraintBuilder {
  constructor(rdf, datatype) {
    this.sh = rdf.ns.sh
    this.datatype = datatype
  }

  add() {}

  build(ptr) {
    ptr.addOut(this.sh.datatype, this.datatype)
  }
}

export class RangeConstraintBuilder {
  constructor(rdf, object, parser) {
    this.sh = rdf.ns.sh
    this.parser = parser
    this.minObject = object
    this.maxObject = object
    const value = parser(object) // error handling?
    this.min = value
    this.max = value
  }

  add(object) {
    const value = this.parser(object) // error handling?
    if (value < this.min) {
      this.min = value
      this.minObject = object
    }
    if (value > this.max) {
      this.max = value
      this.maxObject = object
    }
  }

  build(ptr) {
    ptr.addOut(this.sh.minInclusive, this.minObject)
    ptr.addOut(this.sh.maxInclusive, this.maxObject)
  }
}

export class ValuesConstraintBuilder {
  constructor(rdf, object, threshold) {
    this.sh = rdf.ns.sh
    this.threshold = threshold
    this.values = rdf.termSet([object])
  }

  #strategy = object => {
    if (this.values.size === this.threshold) {
      this.message = 'Too many values for in-list constraint.' // TODO: better message
      this.values.clear()
      this.#strategy = _ => {}
    } else {
      this.values.add(object)
    }
  }

  add(object) {
    this.#strategy(object)
  }

  build(ptr) {
    if (this.values.size > 0) {
      ptr.addList(this.sh.in, this.values)
    }
  }
}

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
