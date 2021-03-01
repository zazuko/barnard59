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

  static create () {
    return new JsonParse()
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

  static create () {
    return new JsonStringify()
  }
}

export const parse = JsonParse.create
export const stringify = JsonStringify.create
