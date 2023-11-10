import $rdf from '@zazuko/env-node'

const cube = $rdf.namespace('https://cube.link/')
const ex = $rdf.namespace('http://example.org/')
const { rdf, schema, sh, xsd } = $rdf.ns

export {
  cube,
  ex,
  rdf,
  schema,
  sh,
  xsd,
}
