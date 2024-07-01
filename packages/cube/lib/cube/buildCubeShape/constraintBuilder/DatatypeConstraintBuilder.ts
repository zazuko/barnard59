import type { Term, NamedNode } from '@rdfjs/types'
import type { Environment } from 'barnard59-env'
import type { Sh } from '@tpluscode/rdf-ns-builders/vocabularies/sh'
import type { GraphPointer } from 'clownface'
import type { Builder } from './CompositeConstraintBuilder.js'

export class DatatypeConstraintBuilder implements Builder {
  declare sh: Sh
  declare datatype: NamedNode
  declare enabled: boolean

  constructor(rdf: Environment, datatype: NamedNode) {
    this.sh = rdf.ns.sh
    this.datatype = datatype
    this.enabled = true
  }

  add(object: Term) {
    if (!('datatype' in object) || !this.datatype.equals(object.datatype)) {
      this.enabled = false
    }
  }

  build(ptr: GraphPointer) {
    if (this.enabled) {
      ptr.addOut(this.sh.datatype, this.datatype)
    }
  }
}
