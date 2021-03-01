import { Transform } from 'readable-stream'

export default class ToString extends Transform {
  constructor () {
    super({
      writableObjectMode: true,
      readableObjectMode: false
    })
  }

  _transform (chunk, encoding, callback) {
    callback(null, chunk.toString())
  }

  static create () {
    return new ToString()
  }
}
