import sinkToDuplex from '@rdfjs/sink-to-duplex'
import { RdfXmlParser } from 'rdfxml-streaming-parser'

function parse() {
  return sinkToDuplex(new RdfXmlParser({
    dataFactory: this.env,
  }), {
    readableObjectMode: true,
    writableObjectMode: true,
  })
}

export { parse }
