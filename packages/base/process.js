import { Transform } from 'readable-stream'

class StdOut extends Transform {
  /**
   * @param {Uint8Array | string} chunk
   * @param {BufferEncoding} encoding
   * @param {(error?: Error | null, data?: any) => void} callback
   */
  _transform(chunk, encoding, callback) {
    process.stdout.write(chunk, encoding)

    callback(null, chunk)
  }
}

/**
 * @return {Transform}
 */
export function stdout() {
  return new StdOut()
}

/**
 * @return {import('stream').Readable}
 */
export function stdin() {
  return process.stdin
}
