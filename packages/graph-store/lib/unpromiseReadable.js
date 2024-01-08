import toReadable from 'duplex-to/readable.js'
import { PassThrough } from 'readable-stream'

/**
 * @param {Promise<import('stream').Readable>} promise
 */
function unpromiseReadable(promise) {
  const stream = new PassThrough({ objectMode: true })

  promise.then(source => {
    source.pipe(stream)
  }).catch(err => {
    stream.destroy(err)
  })

  return toReadable(stream)
}

export default unpromiseReadable
