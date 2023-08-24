import sinkToDuplex from '@rdfjs/sink-to-duplex'
import { RdfXmlParser } from 'rdfxml-streaming-parser'

function parse () {
  return sinkToDuplex(new RdfXmlParser(), {
    readableObjectMode: true,
    writableObjectMode: true
  })
}

export { parse }
