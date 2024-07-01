import type { Quad } from '@rdfjs/types'
import type { Context } from 'barnard59-core'

export default function (this: Context, batch: Iterable<Iterable<Quad>>) {
  const result = this.env.dataset()
  for (const quads of batch) {
    result.addAll(quads)
  }
  return result
}
