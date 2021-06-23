import { Transform } from 'readable-stream'

class ToString extends Transform {
  constructor () {
    super({
      writableObjectMode: true,
      readableObjectMode: false
    })
  }

  _transform (chunk, encoding, callback) {
    callback(null, chunk.toString())
  }
}

function factory () {
  return new ToString()
}

export default factory
