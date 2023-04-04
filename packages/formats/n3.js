import Parser from '@rdfjs/parser-n3'
import sinkToDuplex from '@rdfjs/sink-to-duplex'

function parse (args) {
  return sinkToDuplex(new Parser(args), {
    readableObjectMode: true,
    writableObjectMode: true
  })
}

export { parse }
