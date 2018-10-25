const Writable = require('readable-stream').Writable

class Nul extends Writable {
  constructor () {
    super({ objectMode: true })
  }

  _write (chunk, encoding, callback) {
    callback()
  }

  static create () {
    return new Nul()
  }
}

module.exports = Nul.create
