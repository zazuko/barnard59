import rdf from 'barnard59-env'

/**
 * @type {Set<import('@rdfjs/types').Term>}
 */
const wellKnownDatasetClasses = rdf.termSet([
  rdf.ns.schema.Dataset,
  rdf.ns.cube.Cube,
],
)

/**
 * @type {Set<import('@rdfjs/types').Term>}
 */
const wellKnownDatasetClassesWithDcterms = rdf.termSet([
  rdf.ns._void.Dataset,
  rdf.ns.dcat.Dataset,
],
)

export { wellKnownDatasetClasses, wellKnownDatasetClassesWithDcterms }
