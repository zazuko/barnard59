// @ts-check
import { createWriteStream } from 'node:fs'
import { Readable, Writable } from 'node:stream'

/**
 * Create a writable stream from a path.
 *
 * @param {string} path Path to write to.
 * @returns {WritableStream} Writable stream.
 */
export const createWritableStream = (path) => {
  const stream = createWriteStream(path)
  return Writable.toWeb(stream)
}

/**
 * Convert a ReadableStream to a Readable.
 *
 * @param {any} webStream The WebStream to convert.
 * @returns {Readable} The Node.js stream.
 */
export const toReadable = (webStream) => {
  const nodeStream = new Readable({
    // The read method is called when the stream wants to pull more data in
    read: () => { },
  })

  // Handle each chunk of data
  const reader = webStream.getReader()
  const pump = () => {
    reader.read().then(({ done, value }) => {
      if (done) {
        // When no more data, close the stream
        nodeStream.push(null)
      } else {
        // Push the data into the Node.js stream
        nodeStream.push(Buffer.from(value))
        pump()
      }
    }).catch(err => {
      // Handle any errors
      nodeStream.emit('error', err)
    })
  }

  // Start pumping data
  pump()

  return nodeStream
}
