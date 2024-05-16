import Parser from '@rdfjs/parser-n3'
import sinkToDuplex from '@rdfjs/sink-to-duplex'

/**
 * @this {import('barnard59-core').Context}
 * @param {import('@rdfjs/parser-n3').ParserOptions} args
 */
function parse(args) {
  return sinkToDuplex(new Parser({ factory: this.env, ...args }), {
    readableObjectMode: true,
    writableObjectMode: true,
  })
}

export { parse }
