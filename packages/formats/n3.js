import Parser from '@rdfjs/parser-n3'
import sinkToDuplex from '@rdfjs/sink-to-duplex'

function parse () {
  return sinkToDuplex(new Parser(), {
    readableObjectMode: true,
    writableObjectMode: true
  })
}

export { parse }
