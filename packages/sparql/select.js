const Client = require('sparql-http-client')

function select ({ endpoint, query, user, password }) {
  const client = new Client({ endpointUrl: endpoint, user, password })

  return client.query.select(query)
}

module.exports = select
