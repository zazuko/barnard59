import Client from 'sparql-http-client'
import unpromiseReadable from './lib/unpromiseReadable.js'

function get({ endpoint, graph, user, password }) {
  const client = new Client({
    storeUrl: endpoint,
    user,
    password,
  })

  if (!graph || this.env.defaultGraph().equals(graph)) {
    graph = this.env.defaultGraph()
  } else {
    graph = this.env.namedNode(graph.value || graph)
  }

  return unpromiseReadable(client.store.get(graph))
}

export default get
