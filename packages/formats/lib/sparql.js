const sinkToDuplex = require('./sinkToDuplex')
const SparqlStore = require('rdf-store-sparql')

function upload (endpoint) {
  const store = new SparqlStore(endpoint, { updateUrl: endpoint, maxQueryLength: 1024 * 64 })

  return sinkToDuplex(store, { objectMode: true })
}

module.exports = {
  upload
}
