const { Readable } = require('readable-stream')
const ReadableToReadable = require('./ReadableToReadable')

/**
 * wraps only the readable part of a duplex stream
 */
class DuplexToReadable extends Readable {
  constructor (stream, options) {
    super(options)

    this.pipe = new ReadableToReadable(stream, this)
  }

  async _read (size) {
    this.pipe.read(size)
  }

  _destroy (err, callback) {
    this.pipe.destroy()

    callback(err)
  }
}

module.exports = DuplexToReadable
