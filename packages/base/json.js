import { Transform } from 'readable-stream'

class JsonParse extends Transform {
  constructor () {
    super({
      writableObjectMode: false,
      readableObjectMode: true
    })
  }

  _transform (chunk, encoding, callback) {
    callback(null, JSON.parse(chunk.toString()))
  }
}

class JsonStringify extends Transform {
  constructor () {
    super({
      writableObjectMode: true,
      readableObjectMode: false
    })
  }

  _transform (chunk, encoding, callback) {
    callback(null, JSON.stringify(chunk))
  }
}

function parse () {
  return new JsonParse()
}

function stringify () {
  return new JsonStringify()
}

export { parse, stringify }
