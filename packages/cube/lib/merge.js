/**
 * @this {import('barnard59-core').Context}
 * @param {Iterable<Iterable<import('@rdfjs/types').Quad>>} batch
 */
export default function (batch) {
  const result = this.env.dataset()
  for (const quads of batch) {
    result.addAll(quads)
  }
  return result
}
