import rdf from 'barnard59-env'
import * as ns from '../namespaces.js'

const wellKnownDatasetClasses = rdf.termSet([
  ns.schema.Dataset,
  ns.cube.Cube,
],
)

const wellKnownDatasetClassesWithDcterms = rdf.termSet([
  ns._void.Dataset,
  ns.dcat.Dataset,
],
)

export { wellKnownDatasetClasses, wellKnownDatasetClassesWithDcterms }
