import Serializer from '@rdfjs/serializer-ntriples'
import sinkToDuplex from '@rdfjs/sink-to-duplex'

function serialize () {
  return sinkToDuplex(new Serializer(), {
    readableObjectMode: true,
    writableObjectMode: true
  })
}

export { serialize }
