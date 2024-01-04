/**
 * Limit the amount of chunks in a pipe.
 * @param {number} offset
 */
export default function (offset) {
  /**
   * @param {AsyncIterable<*>} stream
   */
  return async function * (stream) {
    let count = 0

    for await (const chunk of stream) {
      count++
      if (count > offset) {
        yield chunk
      }
    }
  }
}
