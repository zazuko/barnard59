import Client from 'sparql-http-client'

/**
 * @this {import('barnard59-core').Context}
 * @param {Pick<import('sparql-http-client/StreamClient.js').Options<any>, 'user' | 'password'> & {
 *   endpoint: string,
 *   graph: string | import('@rdfjs/types').NamedNode | import('@rdfjs/types').DefaultGraph,
 * }} options
 */
function get({ endpoint, graph, user, password }) {
  const client = new Client({
    factory: this.env,
    storeUrl: endpoint,
    user,
    password,
  })

  /** @type {import('@rdfjs/types').Quad_Graph} */
  let graphTerm
  if (!graph) {
    graphTerm = this.env.defaultGraph()
  } else if (typeof graph === 'string') {
    graphTerm = this.env.namedNode(graph)
  } else if (this.env.defaultGraph().equals(graph)) {
    graphTerm = this.env.defaultGraph()
  } else {
    graphTerm = this.env.namedNode(graph.value)
  }

  return client.store.get(graphTerm)
}

export default get
