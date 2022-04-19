import TermSet from '@rdfjs/term-set'
import * as ns from '../namespaces.js'

const wellKnownDatasetClasses = new TermSet([
  ns.schema.Dataset,
  ns.cube.Cube
]
)

const wellKnownDatasetClassesWithDcterms = new TermSet([
  ns._void.Dataset,
  ns.dcat.Dataset
]
)

export { wellKnownDatasetClasses, wellKnownDatasetClassesWithDcterms }
