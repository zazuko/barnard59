import sinkToDuplex from '@rdfjs/sink-to-duplex'
import { RdfXmlParser } from 'rdfxml-streaming-parser'

/**
 * @this {import('barnard59-core').Context}
 */
function parse() {
  return sinkToDuplex(new RdfXmlParser({
    dataFactory: this.env,
  }), {
    readableObjectMode: true,
    writableObjectMode: true,
  })
}

export { parse }
