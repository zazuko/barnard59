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
  #defaultKey

  constructor({ rdf, datatypeParsers, inListThreshold }) {
    this.rdf = rdf
    this.datatypeParsers = datatypeParsers
    this.inListThreshold = inListThreshold
    this.builders = rdf.termMap()
    this.#defaultKey = rdf.blankNode()
  }

  add(object) {
    const key = object.datatype ?? this.#defaultKey
    if (this.builders.has(key)) {
      this.builders.get(key).add(object)
      return
    }
    if (key === this.#defaultKey) {
      this.builders.set(key, new ValuesConstraintBuilder(this.rdf, object, this.inListThreshold))
      return
    }
    if (this.datatypeParsers.has(key)) {
      this.builders.set(key, new CompositeConstraintBuilder(
        new DatatypeConstraintBuilder(this.rdf, object.datatype),
        new RangeConstraintBuilder(this.rdf, object, this.datatypeParsers.get(key))))
      return
    }
    this.builders.set(key, new CompositeConstraintBuilder(
      new DatatypeConstraintBuilder(this.rdf, object.datatype),
      new ValuesConstraintBuilder(this.rdf, object, this.inListThreshold)))
  }

  build(ptr) {
    // TODO: check for error messages (too many values..)

    const builders = [...this.builders.values()]
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
