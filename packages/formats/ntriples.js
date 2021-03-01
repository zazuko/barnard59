import sinkToDuplex from '@rdfjs/sink-to-duplex'
import Serializer from '@rdfjs/serializer-ntriples'

export function serialize () {
  return sinkToDuplex(new Serializer(), {
    readableObjectMode: true,
    writableObjectMode: true
  })
}
