import TermSet from '@rdfjs/term-set'
import * as ns from '../namespaces.js'

const wellKnownDatasetClasses = new TermSet([
  ns._void.Dataset,
  ns.schema.Dataset,
  ns.dcat.Dataset]
)

export { wellKnownDatasetClasses }