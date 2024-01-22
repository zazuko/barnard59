import Client from 'sparql-http-client'
import unpromiseReadable from './lib/unpromiseReadable.js'

/**
 * @this {import('barnard59-core').Context}
 * @param {Pick<import('sparql-http-client').StreamClientOptions, 'user' | 'password'> & {
 *   endpoint: string,
 *   graph: string | import('@rdfjs/types').NamedNode | import('@rdfjs/types').DefaultGraph,
 * }} options
 */
function get({ endpoint, graph, user, password }) {
  const client = new Client({
    storeUrl: endpoint,
    user,
    password,
  })

  if (!graph) {
    graph = this.env.defaultGraph()
  } else if (typeof graph === 'string') {
    graph = this.env.namedNode(graph)
  } else if (this.env.defaultGraph().equals(graph)) {
    graph = this.env.defaultGraph()
  } else {
    graph = this.env.namedNode(graph.value)
  }

  return unpromiseReadable(client.store.get(graph))
}

export default get
