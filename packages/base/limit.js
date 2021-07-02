import { obj } from 'through2'

/**
 * Limit the amount of chunks in a pipe.
 * @param {number} limit Limit the amount of chunks passed through the pipe.
 * @memberof module:barnard59
 */
function limit (limit) {
  const t = obj(function (chunk, encoding, callback) {
    t.count++

    if (t.count <= t.limit) {
      this.push(chunk)
    }

    callback()
  })

  t.limit = limit
  t.count = 0

  return t
}

export default limit
