// @ts-check
import transform from 'parallel-transform'

/**
 * @typedef {(this: import('barnard59-core').Context, chunk: From) => Promise<To> | To} MapCallback
 * @template From, To
 */

/**
 * @typedef {{
 *   map: MapCallback<From, To>
 *   concurrency?: number
 *   ordered?: boolean
 *   objectMode?: boolean
 * }|MapCallback<From, To>} MapOptions
 * @template From, To
 */

/**
 * Processes chunks with a transform function
 *
 * @this {import('barnard59-core').Context}
 * @param {MapOptions<From, To>} options Transform function or complex options
 * @return {import('stream').Transform}
 * @template From, To
 */
export default function map(options) {
  /**
   * @type {MapCallback<*, *>}
   */
  let func
  let concurrency = 1
  let ordered = true
  let objectMode = true
  if (typeof options === 'function') {
    func = options
  } else {
    func = options.map
    concurrency = options.concurrency || concurrency
    ordered = typeof options.ordered === 'boolean' ? options.ordered : ordered
    objectMode = typeof options.objectMode === 'boolean' ? options.objectMode : objectMode
  }

  return transform(concurrency, { ordered, objectMode }, (data, callback) => {
    Promise.resolve().then(() => {
      return func.call(this, data)
    }).then(result => {
      callback(null, result)
    }).catch(callback)
  })
}
