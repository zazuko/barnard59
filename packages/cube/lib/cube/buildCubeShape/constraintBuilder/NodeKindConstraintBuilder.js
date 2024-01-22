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
