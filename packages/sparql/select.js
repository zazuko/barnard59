import readable from 'duplex-to/readable.js'
import Client from 'sparql-http-client'

// Matches an optional prologue (comments, PREFIX/BASE declarations) followed by SELECT or ASK.
// Rejects queries that are actually update/other operations (e.g. INSERT, DELETE, DROP),
// preventing a query string from being used to perform unintended write operations.
const ALLOWED_OPERATION = /^(?:\s*#[^\n]*\n|\s*(?:BASE|PREFIX)\s+(?:[^\s:]*:)?\s*<[^>]*>)*\s*(SELECT|ASK)\b/i

/**
 * @this {import('barnard59-core').Context}
 * @param {Object} options
 * @param {string} options.endpoint
 * @param {string} options.query
 * @param {string} [options.user]
 * @param {string} [options.password]
 * @param {import('sparql-http-client').QueryOptions['operation']} options.operation
 */
async function select({ endpoint, query, user, password, operation }) {
  if (typeof query !== 'string' || !ALLOWED_OPERATION.test(query)) {
    throw new Error('select operation only accepts SELECT or ASK queries')
  }

  const client = new Client({
    factory: this.env,
    endpointUrl: endpoint,
    user,
    password,
  })

  return readable(client.query.select(query, { operation }))
}

export default select
