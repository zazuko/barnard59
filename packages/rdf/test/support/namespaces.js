import $rdf from '@zazuko/env'

const ex = $rdf.namespace('http://example.org/')
const { rdf, schema, sh, xsd } = $rdf.ns

export {
  ex,
  rdf,
  schema,
  sh,
  xsd,
}
