const Transform = require('readable-stream').Transform

class StdOut extends Transform {
  _transform (chunk, encoding, callback) {
    process.stdout.write(chunk, encoding)

    callback(null, chunk)
  }

  static create () {
    return new StdOut()
  }
}

module.exports = StdOut.create
