const namespace = require('@rdfjs/namespace')
const rdf = require('rdf-ext')

const ns = {
  ex: namespace('http://example.org/', { factory: rdf })
}

module.exports = ns
