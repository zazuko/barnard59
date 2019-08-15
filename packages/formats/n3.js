const sinkToDuplex = require('@rdfjs/sink-to-duplex')
const Parser = require('@rdfjs/parser-n3')

function parse () {
  return sinkToDuplex(new Parser(), {
    readableObjectMode: true,
    writableObjectMode: true
  })
}

module.exports = {
  parse
}
