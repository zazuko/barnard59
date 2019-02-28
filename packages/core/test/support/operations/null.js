const { Writable } = require('readable-stream')

class NullStream extends Writable {
  constructor () {
    super({
      objectMode: true,
      write: (chunk, encoding, callback) => callback()
    })
  }

  static create () {
    return new NullStream()
  }
}

module.exports = NullStream.create
