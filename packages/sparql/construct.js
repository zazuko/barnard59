const Client = require('sparql-http-client')

function construct ({ endpoint, query, user, password }) {
  const client = new Client({ endpointUrl: endpoint, user, password })

  return client.query.construct(query)
}

module.exports = construct
