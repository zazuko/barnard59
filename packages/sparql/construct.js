import Client from 'sparql-http-client'

function construct ({ endpoint, query, user, password, operation }) {
  const client = new Client({ endpointUrl: endpoint, user, password })

  return client.query.construct(query, { operation })
}

export default construct
