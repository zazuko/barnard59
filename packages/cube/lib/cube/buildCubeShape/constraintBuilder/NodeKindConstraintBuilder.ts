import type { Term } from '@rdfjs/types'
import type { Environment } from 'barnard59-env'
import type { Sh } from '@tpluscode/rdf-ns-builders/vocabularies/sh'
import type { GraphPointer } from 'clownface'
import type { Builder } from './CompositeConstraintBuilder.js'

export class NodeKindConstraintBuilder implements Builder {
  declare sh: Sh

  #termTypes = new Set()

  /**
   * @param {import('barnard59-env').Environment} rdf
   */
  constructor(rdf: Environment) {
    this.sh = rdf.ns.sh
  }

  add(object: Term) {
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

  build(ptr: GraphPointer) {
    if (this.#nodeKind !== undefined) {
      ptr.addOut(this.sh.nodeKind, this.#nodeKind)
    }
  }
}
