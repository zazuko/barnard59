import rdf from 'barnard59-env'

const wellKnownDatasetClasses = rdf.termSet([
  rdf.ns.schema.Dataset,
  rdf.ns.cube.Cube,
],
)

const wellKnownDatasetClassesWithDcterms = rdf.termSet([
  rdf.ns._void.Dataset,
  rdf.ns.dcat.Dataset,
],
)

export { wellKnownDatasetClasses, wellKnownDatasetClassesWithDcterms }
