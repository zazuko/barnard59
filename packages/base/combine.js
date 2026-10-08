import duplexify from 'duplexify'

/**
 * Limit the amount of chunks in a pipe.
 * @returns {import('node:stream').Duplex} A transform stream.
 * @param {import('node:stream').Duplex[]} streams
 * @param {*} [options]
 */
function combine(streams, options) {
  if (streams.length === 0) {
    throw new Error('no streams to combine')
  }

  if (streams.length === 1) {
    return /** @type {import('node:stream').Duplex} */ (streams[0])
  }

  for (let index = 0; index < streams.length - 1; index++) {
    streams[index].pipe(streams[index + 1])
  }

  return /** @type {import('node:stream').Duplex} */ (/** @type {unknown} */ (duplexify(
    /** @type {import('node:stream').Writable} */ (/** @type {unknown} */ (streams[0])),
    /** @type {import('node:stream').Readable} */ (/** @type {unknown} */ (streams[streams.length - 1])),
    options,
  )))
}

export default combine
