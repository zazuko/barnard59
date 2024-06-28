import type { Term } from '@rdfjs/types'
import type { GraphPointer } from 'clownface'

export interface Builder {
  add(object: Term): void
  build(ptr: GraphPointer): void
  enabled?: boolean
}

export class CompositeConstraintBuilder implements Builder {
  declare builders: Builder[]

  constructor(...builders: Builder[]) {
    this.builders = builders
  }

  add(object: Term) {
    this.builders.forEach(builder => builder.add(object))
  }

  build(ptr: GraphPointer) {
    this.builders.forEach(builder => builder.build(ptr))
  }
}
