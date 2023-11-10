import $rdf from '@zazuko/env-node'

const cube = $rdf.namespace('https://cube.link/')
const { rdf, rdfs, sh, xsd, _void, dcat, schema, dcterms } = $rdf.ns

export { cube, rdf, rdfs, sh, xsd, _void, dcat, schema, dcterms }
