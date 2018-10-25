const formats = require('@rdfjs/formats-common')
const fs = require('fs')
const rdf = require('rdf-ext')
const stringToReadable = require('./toReadable').string

function fileToDataset (mediaType, filename) {
  return rdf.dataset().import(formats.parsers.import(mediaType, fs.createReadStream(filename)))
}

function stringToDataset (mediaType, string) {
  return rdf.dataset().import(formats.parsers.import(mediaType, stringToReadable(string)))
}

module.exports = {
  fileToDataset,
  stringToDataset
}
