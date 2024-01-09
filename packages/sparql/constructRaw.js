import Client from 'sparql-http-client/SimpleClient.js'

async function constructRaw({ endpoint, query, user, password, operation }) {
  const client = new Client({ endpointUrl: endpoint, user, password })

  const response = await client.query.construct(query, { operation })
  return response.body
}

export default constructRaw
