/**
 * @param {import('barnard59-env').Environment} env
 * @param {string | import('clownface').GraphPointer<import('@rdfjs/types').NamedNode> | import('@rdfjs/types').NamedNode} graph
 */
export function toTerm(env, graph) {
  return typeof graph === 'string'
    ? graph.toUpperCase() === 'DEFAULT'
      ? env.defaultGraph()
      : env.namedNode(graph)
    : 'termType' in graph
      ? graph
      : graph.term
}
