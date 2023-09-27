// @ts-check
import { createWriteStream } from 'fs'
import { WritableStream } from 'stream/web'

/**
 * Create a writable stream.
 *
 * @param {string} path Path to write to.
 * @returns {WritableStream} Writable stream.
 */
export const createWritableStream = (path) => {
  const stream = createWriteStream(path)
  const writableStream = new WritableStream({

    /**
     * Write data to the stream.
     *
     * @param {any} chunk
    */
    // eslint-disable-next-line space-before-function-paren
    write (chunk) {
      stream.write(chunk)
    },
  })
  return writableStream
}
