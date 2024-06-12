import type { Context } from 'barnard59-core'
import type { Quad } from '@rdfjs/types'

export function excludeCsvwTriples(this: Context, quad: Quad) {
  if (quad.predicate.value.startsWith(this.env.ns.csvw('').value)) {
    return false
  }

  if (this.env.ns.rdf.type.equals(quad.predicate) && quad.object.value.startsWith(this.env.ns.csvw('').value)) {
    return false
  }

  return true
}
