import rdf from '@rdfjs/data-model'
import Client from 'sparql-http-client'
import unpromiseReadable from './lib/unpromiseReadable.js'

function get ({ endpoint, graph, user, password }) {
  const client = new Client({
    storeUrl: endpoint,
    user,
    password
  })

  if (!graph || rdf.defaultGraph().equals(graph)) {
    graph = rdf.defaultGraph()
  } else {
    graph = rdf.namedNode(graph.value || graph)
  }

  return unpromiseReadable(client.store.get(graph))
}

export default get
