const defaultFetch = require('isomorphic-fetch')
const resultParser = require('./resultParser')
const SparqlHttpClient = require('sparql-http-client')

class SparqlClient {
  constructor ({ endpoint, fetch = defaultFetch, user, password } = {}) {
    this.client = new SparqlHttpClient({ endpointUrl: endpoint, fetch })
    this.user = user
    this.password = password
  }

  headers () {
    const headers = {}

    headers.accept = 'application/json, application/sparql-results+json'

    if (typeof this.user === 'string' && typeof this.password === 'string') {
      headers.authorization = 'Basic ' + Buffer.from(`${this.user}:${this.password}`).toString('base64')
    }

    return headers
  }

  async select (query) {
    const response = await this.client.selectQuery(query, { headers: this.headers() })

    if (!response.ok) {
      throw response.error()
    }

    const parser = resultParser()

    response.body.pipe(parser)

    return parser
  }
}

module.exports = SparqlClient
