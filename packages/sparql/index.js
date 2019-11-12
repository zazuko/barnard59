const SparqlClient = require('./lib/SparqlClient')

function select ({ endpoint, query, user, password }) {
  const client = new SparqlClient({ endpoint, user, password })

  return client.select(query)
}

module.exports = {
  select
}
