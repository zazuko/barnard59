import rdf from '@rdfjs/data-model'
import Client from 'sparql-http-client'
import SinkToWritable from './lib/SinkToWritable.js'
import unpromiseReadable from './lib/unpromiseReadable.js'

export function get ({ endpoint, graph, user, password }) {
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

export function post ({ endpoint, user, password, maxQuadsPerRequest = 500000 }) {
  const client = new Client({
    storeUrl: endpoint,
    user,
    password,
    maxQuadsPerRequest
  })

  return new SinkToWritable(readable => client.store.post(readable))
}

export function put ({ endpoint, user, password, maxQuadsPerRequest = 500000 }) {
  const client = new Client({
    storeUrl: endpoint,
    user,
    password,
    maxQuadsPerRequest
  })

  return new SinkToWritable(readable => client.store.put(readable))
}
