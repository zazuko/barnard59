import readable from 'duplex-to/readable.js'
import Client from 'sparql-http-client'

async function select ({ endpoint, query, user, password }) {
  const client = new Client({ endpointUrl: endpoint, user, password })

  return readable(await client.query.select(query))
}

export default select
