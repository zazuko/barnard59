import type { Term } from '@rdfjs/types'
import type { GraphPointer } from 'clownface'
import type { Environment } from 'barnard59-env'
import type { Sh } from '@tpluscode/rdf-ns-builders/vocabularies/sh'

export class ValuesConstraintBuilder {
  declare sh: Sh
  declare threshold?: number
  declare values: Set<Term>
  declare enabled: boolean
  declare message: string | undefined

  constructor(rdf: Environment, threshold?: number) {
    this.sh = rdf.ns.sh
    this.threshold = threshold
    this.values = rdf.termSet()
    this.enabled = true
  }

  add(object: Term) {
    if (!this.enabled) return
    this.values.add(object)
    if (this.threshold && this.values.size > this.threshold) {
      this.enabled = false
      this.message = 'Too many values for in-list constraint.' // TODO: better message
      this.values.clear()
    }
  }

  build(ptr: GraphPointer) {
    if (this.message) {
      ptr.addOut(this.sh.description, this.message)
      return
    }
    if (this.enabled && this.values.size > 0) {
      ptr.addList(this.sh.in, this.values)
    }
  }
}
