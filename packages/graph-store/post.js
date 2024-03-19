import { Duplex } from 'node:stream'
import Client from 'sparql-http-client'
import duplexTo from 'duplex-to'
import { toTerm } from './lib/graph.js'
import storeWritable from './lib/storeWritable.js'

/**
 * @this {import('barnard59-core').Context}
 * @param {Pick<import('sparql-http-client/StreamClient.js').Options<any>, 'user' | 'password'> & {
 *   endpoint: string,
 *   graph: string | import('clownface').GraphPointer<import('@rdfjs/types').NamedNode> | import('@rdfjs/types').NamedNode,
 * }} options
 * @returns {import('node:stream').Writable}
 */
function post({ endpoint, graph, user, password }) {
  if (!graph) {
    throw new Error('graph is required')
  }

  const client = new Client({
    factory: this.env,
    storeUrl: endpoint,
    user,
    password,
  })

  return duplexTo.writable(Duplex.from(storeWritable(readable => client.store.post(readable, {
    graph: toTerm(this.env, graph),
  }), this)))
}

export default post
