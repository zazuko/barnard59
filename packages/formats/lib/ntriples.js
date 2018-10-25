const sinkToDuplex = require('./sinkToDuplex')
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
