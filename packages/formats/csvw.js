const rdf = require('rdf-ext')
const sinkToDuplex = require('@rdfjs/sink-to-duplex')
const CsvwParser = require('rdf-parser-csvw')

function toDataset (streamOrDataset) {
  if (!streamOrDataset.readable) {
    return Promise.resolve(streamOrDataset)
  }

  return rdf.dataset().import(streamOrDataset)
}

function parse (metadata) {
  return toDataset(metadata).then(dataset => {
    return sinkToDuplex(new CsvwParser({ metadata: dataset }), {
      readableObjectMode: true
    })
  })
}

module.exports = {
  parse
}
