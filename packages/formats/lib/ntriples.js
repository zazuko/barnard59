const sinkToDuplex = require('@rdfjs/sink-to-duplex')
const Serializer = require('@rdfjs/serializer-ntriples')

function serialize () {
  return sinkToDuplex(new Serializer(), {
    readableObjectMode: true,
    writableObjectMode: true
  })
}

module.exports = {
  serialize
}
