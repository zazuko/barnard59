import Client from 'sparql-http-client'
import SinkToWritable from './lib/SinkToWritable.js'

/**
 * @param {Pick<import('sparql-http-client').StreamClientOptions, 'user' | 'password'> & {
 *   endpoint: string,
 *   maxQuadsPerRequest?: number,
 * }} options
 * @returns {import('readable-stream').Writable}
 */
function put({ endpoint, user, password, maxQuadsPerRequest }) {
  const client = new Client({
    storeUrl: endpoint,
    user,
    password,
    maxQuadsPerRequest,
  })

  return new SinkToWritable(readable => client.store.put(readable))
}

export default put
