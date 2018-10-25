const Transform = require('readable-stream').Transform

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

  static create () {
    return new ToString()
  }
}

module.exports = ToString.create
