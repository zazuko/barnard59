import Client from 'sparql-http-client'

/**
 * @this {import('barnard59-core').Context}
 * @param {Object} options
 * @param {string} options.endpoint
 * @param {string} options.query
 * @param {string} [options.user]
 * @param {string} [options.password]
 * @param {import('sparql-http-client').QueryOptions['operation']} options.operation
 */
function construct({ endpoint, query, user, password, operation }) {
  // Input validation: surface a clear error early rather than an opaque failure from the SPARQL client
  if (typeof query !== 'string' || !query.trim()) {
    throw new Error('query must be a non-empty string')
  }

  const client = new Client({
    factory: this.env,
    endpointUrl: endpoint,
    user,
    password,
  })

  return client.query.construct(query, { operation })
}

export default construct
