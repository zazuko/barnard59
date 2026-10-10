import transform from 'rdf-transform-graph-imports'

/**
 * @this {import('barnard59-core').Context}
 * @return {import('node:stream').Transform}
 */
export default function () {
  return transform(this.env)
}
