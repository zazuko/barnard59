export function excludeCsvwTriples(quad) {
  if (quad.predicate.value.startsWith(this.env.ns.csvw('').value)) {
    return false
  }

  if (this.env.ns.rdf.type.equals(quad.predicate) && quad.object.value.startsWith(this.env.ns.csvw('').value)) {
    return false
  }

  return true
}
