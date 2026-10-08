import readable from 'duplex-to/readable.js'
import Client from 'sparql-http-client'
import { Parser } from 'sparqljs'

const parser = new Parser()

/**
 * Parses the query and allows only SELECT and ASK. Anything else, including
 * SPARQL Update operations and unparseable input, is rejected.
 *
 * @param {unknown} query
 */
function assertSelectOrAsk(query) {
  const message = 'select operation only accepts SELECT or ASK queries'

  if (typeof query !== 'string') {
    throw new Error(message)
  }

  let parsed
  try {
    parsed = parser.parse(query)
  } catch {
    throw new Error(message)
  }

  if (parsed.type !== 'query' || !['SELECT', 'ASK'].includes(parsed.queryType)) {
    throw new Error(message)
  }
}

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
  assertSelectOrAsk(query)

  const client = new Client({
    factory: this.env,
    endpointUrl: endpoint,
    user,
    password,
  })

  return readable(client.query.select(query, { operation }))
}

export default select
