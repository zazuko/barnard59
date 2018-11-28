const fs = require('fs')
const rdf = require('rdf-ext')
const N3Parser = require('@rdfjs/parser-n3')

function load (filename) {
  const input = fs.createReadStream(`${__dirname}/../definitions/${filename}`)
  const parser = new N3Parser()

  return rdf.dataset().import(parser.import(input))
}

module.exports = load
