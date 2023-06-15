import $rdf from 'rdf-ext'

const cube = $rdf.namespace('https://cube.link/')
const rdf = $rdf.namespace('http://www.w3.org/1999/02/22-rdf-syntax-ns#')
const rdfs = $rdf.namespace('http://www.w3.org/2000/01/rdf-schema#')
const sh = $rdf.namespace('http://www.w3.org/ns/shacl#')
const xsd = $rdf.namespace('http://www.w3.org/2001/XMLSchema#')
const _void = $rdf.namespace('http://rdfs.org/ns/void#')
const dcat = $rdf.namespace('http://www.w3.org/ns/dcat#')
const schema = $rdf.namespace('http://schema.org/')
const dcterms = $rdf.namespace('http://purl.org/dc/terms/')

export { cube, rdf, rdfs, sh, xsd, _void, dcat, schema, dcterms }
