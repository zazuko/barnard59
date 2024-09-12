import { obj } from 'through2'

/**
 * @typedef {(this: import('barnard59-core').Context, chunk: T, encoding: string, ...args: A) => boolean | Promise<boolean>} Filter<T, A>
 * @template T
 * @template {Array<unknown>} A
 */

/**
 * @template T
 * @template {Array<unknown>} A
 * @this {import('barnard59-core').Context}
 * @param {Filter<T, A>} func
 * @param {A} args
 * @return {import('stream').Transform}
 */
function filter(func, ...args) {
  return obj((chunk, encoding, callback) => {
    Promise.resolve().then(() => {
      return func.call(this, chunk, encoding, ...args)
    }).then(result => {
      if (result) {
        return callback(null, chunk)
      }

      return callback()
    }).catch(callback)
  })
}

export default filter
