import { Readable } from 'readable-stream'
import ReadableToReadable from 'readable-to-readable'

/**
 * wraps only the readable part of a duplex stream
 */
class DuplexToReadable extends Readable {
  constructor (stream, options) {
    super(options)

    this._pipe = new ReadableToReadable(stream, this)
  }

  async _read (size) {
    await this._pipe.forward(size)
  }

  async _destroy (err, callback) {
    await this._pipe.destroy()

    callback(err)
  }
}

export default DuplexToReadable
