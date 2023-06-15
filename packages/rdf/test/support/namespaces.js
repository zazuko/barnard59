import $rdf from 'rdf-ext'

const cube = $rdf.namespace('https://cube.link/')
const ex = $rdf.namespace('http://example.org/')
const rdf = $rdf.namespace('http://www.w3.org/1999/02/22-rdf-syntax-ns#')
const schema = $rdf.namespace('http://schema.org/')
const sh = $rdf.namespace('http://www.w3.org/ns/shacl#')
const xsd = $rdf.namespace('http://www.w3.org/2001/XMLSchema#')

export {
  cube,
  ex,
  rdf,
  schema,
  sh,
  xsd
}
