const rdf = require('@rdfjs/data-model')
const Client = require('sparql-http-client')
const SinkToWritable = require('./lib/SinkToWritable')
const unpromiseReadable = require('./lib/unpromiseReadable')

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

function post ({ endpoint, user, password, maxQuadsPerRequest = 500000 }) {
  const client = new Client({
    storeUrl: endpoint,
    user,
    password,
    maxQuadsPerRequest
  })

  return new SinkToWritable(readable => client.store.post(readable))
}

function put ({ endpoint, user, password, maxQuadsPerRequest = 500000 }) {
  const client = new Client({
    storeUrl: endpoint,
    user,
    password,
    maxQuadsPerRequest
  })

  return new SinkToWritable(readable => client.store.put(readable))
}

module.exports = {
  get,
  post,
  put
}
