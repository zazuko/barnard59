import type { Literal, DataFactory } from '@rdfjs/types'
import type { Environment } from '@rdfjs/environment/Environment.js'
import type { NsBuildersFactory } from '@tpluscode/rdf-ns-builders/Factory.js'

export default class ConstantsFactory {
  FALSE!: Literal

  init(this: Environment<DataFactory | ConstantsFactory | NsBuildersFactory>) {
    this.FALSE = this.literal('false', this.ns.xsd.boolean)
  }
}
