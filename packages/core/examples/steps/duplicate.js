const Transform = require('readable-stream').Transform

class Duplicator extends Transform {
  constructor () {
    super({ objectMode: true })
  }

  _transform (chunk, encoding, callback) {
    this.push(chunk)
    this.push(chunk)

    callback()
  }

  static create () {
    return new Duplicator()
  }
}

module.exports = Duplicator.create
