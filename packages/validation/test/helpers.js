const cf = require('clownface')
const formats = require('@rdfjs/formats-common')
const parser = formats.parsers.get('text/turtle')
const rdf = require('rdf-ext')
const { Readable } = require('stream')

module.exports = {
  turtleToCF
}

async function turtleToCF (str) {
  const stream = Readable.from([str])
  const quadStream = parser.import(stream)
  return cf({ dataset: await rdf.dataset().import(quadStream) })
}
