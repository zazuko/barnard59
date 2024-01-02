// @ts-check
import { Transform } from 'readable-stream'

class JsonParse extends Transform {
  constructor() {
    super({
      writableObjectMode: false,
      readableObjectMode: true,
    })
  }

  /**
   * @param {*} chunk
   * @param {string} encoding
   * @param {(error?: Error | null, data?: any) => void} callback
   */
  _transform(chunk, encoding, callback) {
    callback(null, JSON.parse(chunk.toString()))
  }
}

class JsonStringify extends Transform {
  constructor() {
    super({
      writableObjectMode: true,
      readableObjectMode: false,
    })
  }

  /**
   * @param {*} chunk
   * @param {string} encoding
   * @param {(error?: Error | null, data?: any) => void} callback
   */
  _transform(chunk, encoding, callback) {
    callback(null, JSON.stringify(chunk))
  }
}

/**
 * @return {Transform}
 */
function parse() {
  return new JsonParse()
}

/**
 * @return {Transform}
 */
function stringify() {
  return new JsonStringify()
}

export { parse, stringify }
