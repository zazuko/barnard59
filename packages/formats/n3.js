import sinkToDuplex from '@rdfjs/sink-to-duplex'
import Parser from '@rdfjs/parser-n3'

export function parse () {
  return sinkToDuplex(new Parser(), {
    readableObjectMode: true,
    writableObjectMode: true
  })
}
