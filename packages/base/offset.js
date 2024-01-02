import { obj } from 'through2'

/**
 * Limit the amount of chunks in a pipe.
 * @param {number} offset
 * @returns {import('stream').Transform}
 */
function offset(offset) {
  /** @type {any} */
  const t = obj(function (chunk, encoding, callback) {
    t.count++

    if (t.count > t.offset) {
      this.push(chunk)
    }

    callback()
  })

  t.offset = offset
  t.count = 0

  return t
}

export default offset
