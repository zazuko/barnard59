import { Transform } from 'readable-stream'

class ToString extends Transform {
  constructor() {
    super({
      writableObjectMode: true,
      readableObjectMode: false,
    })
  }

  /**
   * @param {Uint8Array | string} chunk
   * @param {BufferEncoding} encoding
   * @param {import('stream').TransformCallback} callback
   */
  _transform(chunk, encoding, callback) {
    callback(null, chunk.toString())
  }
}

/**
 * @return {Transform}
 */
function factory() {
  return new ToString()
}

export default factory
