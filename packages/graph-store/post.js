import Client from 'sparql-http-client'
import SinkToWritable from './lib/SinkToWritable.js'

/**
 * @this {import('barnard59-core').Context}
 * @param {Pick<import('sparql-http-client/StreamClient.js').Options<any>, 'user' | 'password'> & {
 *   endpoint: string,
 * }} options
 * @returns {import('readable-stream').Writable}
 */
function post({ endpoint, user, password }) {
  const client = new Client({
    factory: this.env,
    storeUrl: endpoint,
    user,
    password,
  })

  return new SinkToWritable(readable => client.store.post(readable))
}

export default post
