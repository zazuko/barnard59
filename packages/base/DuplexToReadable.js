import { Readable } from 'readable-stream'
import { ReadableToReadable } from './ReadableToReadable.js'

/**
 * wraps only the readable part of a duplex stream
 */
export class DuplexToReadable extends Readable {
  constructor (stream, options) {
    super(options)

    this._pipe = new ReadableToReadable(stream, this)
  }

  async _read (size) {
    this._pipe.read(size)
  }

  _destroy (err, callback) {
    this._pipe.destroy()

    callback(err)
  }
}
