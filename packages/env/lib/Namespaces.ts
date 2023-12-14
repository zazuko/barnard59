import type { NsBuildersFactory } from '@tpluscode/rdf-ns-builders/Factory.js'
import type { Environment } from '@rdfjs/environment/Environment.js'
import type { NamespaceFactory } from '@rdfjs/namespace/Factory.js'
import * as Builders from '@zazuko/vocabulary-extras-builders'

declare module '@tpluscode/rdf-ns-builders' {
  interface CustomNamespaces {
    b59: typeof Builders.b59
    p: typeof Builders.pipeline
    pipeline: typeof Builders.pipeline
    code: typeof Builders.code
    cube: typeof Builders.cube
    meta: typeof Builders.meta
    relation: typeof Builders.relation
  }
}

export default class NamespacesFactory {
  init(this: Environment<NamespaceFactory | NsBuildersFactory>) {
    this.ns = {
      ...this.ns,
      ...Builders,
      p: Builders.pipeline,
    }
  }
}
