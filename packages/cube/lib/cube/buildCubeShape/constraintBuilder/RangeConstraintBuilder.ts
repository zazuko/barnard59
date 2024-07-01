import type { Term } from '@rdfjs/types'
import type { Environment } from 'barnard59-env'
import type { Sh } from '@tpluscode/rdf-ns-builders/vocabularies/sh'
import type { GraphPointer } from 'clownface'
import type { DatatypeParser } from '../datatypes.js'
import type { Builder } from './CompositeConstraintBuilder.js'

interface Range {
  min: number
  max: number
  minObject: Term
  maxObject: Term

}

export class RangeConstraintBuilder implements Builder {
  declare sh: Sh
  declare parser: DatatypeParser
  declare enabled: boolean
  declare range: Range | undefined

  // consider removing the parser argument and always use fromRdf from 'rdf-literal'
  // because we rely on its behavior in case of parsing issues
  constructor(rdf: Environment, parser?: DatatypeParser) {
    this.sh = rdf.ns.sh
    if (!parser) {
      throw new Error('RangeConstraintBuilder requires a datatype parser')
    }

    this.parser = parser
    this.enabled = true
  }

  #initRange(object: Term, value: number): Range {
    return {
      min: value,
      max: value,
      minObject: object,
      maxObject: object,
    }
  }

  #updateRange(object: Term, value: number, range: Range) {
    if (value < range.min) {
      range.min = value
      range.minObject = object
    }
    if (value > range.max) {
      range.max = value
      range.maxObject = object
    }
  }

  add(object: Term) {
    if (!this.enabled) return

    if (!('datatype' in object)) {
      this.enabled = false
      return
    }

    const value = this.parser(object)

    if (this.range) {
      this.#updateRange(object, value, this.range)
    } else {
      this.range = this.#initRange(object, value)
    }

    // can be false in case of parsing issues
    this.enabled = (this.range.min <= value && value <= this.range.max)
  }

  build(ptr: GraphPointer) {
    if (this.enabled && this.range) {
      ptr.addOut(this.sh.minInclusive, this.range.minObject)
      ptr.addOut(this.sh.maxInclusive, this.range.maxObject)
    }
  }
}
