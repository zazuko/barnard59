import Client from 'sparql-http-client'
import SinkToWritable from './lib/SinkToWritable.js'

function post ({ endpoint, user, password, maxQuadsPerRequest = 500000 }) {
  const client = new Client({
    storeUrl: endpoint,
    user,
    password,
    maxQuadsPerRequest
  })

  return new SinkToWritable(readable => client.store.post(readable))
}

export default post
