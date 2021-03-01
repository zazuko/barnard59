import sinkToDuplex from '@rdfjs/sink-to-duplex'
import { RdfXmlParser } from 'rdfxml-streaming-parser'

export function parse () {
  return sinkToDuplex(new RdfXmlParser(), {
    readableObjectMode: true,
    writableObjectMode: true
  })
}
