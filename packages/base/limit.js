/**
 * Limit the amount of chunks in a pipe.
 * @param {number} limit Limit the amount of chunks passed through the pipe.
 */
export default function limit(limit) {
  /**
   * @param {AsyncIterable<*>} stream
   */
  return async function * (stream) {
    let count = 0
    for await (const chunk of stream) {
      count++
      if (count <= limit) {
        yield chunk
      }
    }
  }
}
