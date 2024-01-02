// @ts-check
import { obj } from 'through2'

/**
 * @typedef {(this: import('barnard59-core').Context, chunk: T, encoding: string) => boolean | Promise<boolean>} Filter<T>
 * @template T
 */

/**
 * @template T
 * @this {import('barnard59-core').Context}
 * @param {Filter<T>} func
 * @return {import('stream').Transform}
 */
function filter(func) {
  return obj((chunk, encoding, callback) => {
    Promise.resolve().then(() => {
      return func.call(this, chunk, encoding)
    }).then(result => {
      if (result) {
        return callback(null, chunk)
      }

      return callback()
    }).catch(callback)
  })
}

export default filter
