import { Transform } from 'readable-stream'

/**
 * @param {number} [size]
 * @return {Transform}
 */
function batch(size = 0) {
  /** @type {any[]} */
  let array = []
  const maxSize = Number(size)
  return new Transform({
    readableObjectMode: true,
    writableObjectMode: true,
    readableHighWaterMark: maxSize,
    writableHighWaterMark: maxSize,
    transform(item, _encoding, callback) {
      array.push(item)
      if (array.length === maxSize) {
        this.push(array)
        array = []
      }
      callback()
    },
    /**
     * @this {Transform}
     */
    flush(callback) {
      if (array.length > 0) this.push(array)
      callback()
    },
  })
}

export default batch
