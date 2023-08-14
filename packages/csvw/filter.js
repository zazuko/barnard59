import rdf from '@zazuko/env'

export function excludeCsvwTriples(quad) {
  if (quad.predicate.value.startsWith(rdf.ns.csvw('').value)) {
    return false
  }

  if (rdf.ns.rdf.type.equals(quad.predicate) && quad.object.value.startsWith(rdf.ns.csvw('').value)) {
    return false
  }

  return true
}
