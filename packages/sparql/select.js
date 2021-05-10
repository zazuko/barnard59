const { readable } = require('duplex-to')
const Client = require('sparql-http-client')

async function select ({ endpoint, query, user, password }) {
  const client = new Client({ endpointUrl: endpoint, user, password })

  return readable(await client.query.select(query))
}

module.exports = select
