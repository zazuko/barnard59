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
    this.enabled = true
  }

  add(object) {
    if (!this.datatype.equals(object.datatype)) {
      this.enabled = false
    }
  }

  build(ptr) {
    if (this.enabled) {
      ptr.addOut(this.sh.datatype, this.datatype)
    }
  }
}

export class RangeConstraintBuilder {
  // can be false in case of parsing issues
  #isInRange = value => (this.min <= value && value <= this.max)

  // consider removing the parser argument and always use fromRdf from 'rdf-literal'
  // because we rely on its behavior in case of parsing issues
  constructor(rdf, object, parser) {
    this.sh = rdf.ns.sh
    this.parser = parser
    this.minObject = object
    this.maxObject = object
    const value = parser(object)
    this.min = value
    this.max = value
    this.enabled = this.#isInRange(value)
  }

  add(object) {
    if (!this.enabled) return

    if (!object.datatype) {
      this.enabled = false
      return
    }

    const value = this.parser(object)
    if (value < this.min) {
      this.min = value
      this.minObject = object
    }
    if (value > this.max) {
      this.max = value
      this.maxObject = object
    }
    if (!this.#isInRange(value)) {
      this.enabled = false
    }
  }

  build(ptr) {
    if (!this.enabled) return

    ptr.addOut(this.sh.minInclusive, this.minObject)
    ptr.addOut(this.sh.maxInclusive, this.maxObject)
  }
}

export class ValuesConstraintBuilder {
  constructor(rdf, object, threshold) {
    this.sh = rdf.ns.sh
    this.threshold = threshold
    this.values = rdf.termSet([object])
    this.enabled = true
  }

  add(object) {
    if (!this.enabled) return
    this.values.add(object)
    if (this.values.size > this.threshold) {
      this.enabled = false
      this.message = 'Too many values for in-list constraint.' // TODO: better message
      this.values.clear()
    }
  }

  build(ptr) {
    if (this.enabled) {
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
