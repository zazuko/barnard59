import transform from 'parallel-transform'

/**
 * @typedef {(this: import('barnard59-core').Context, chunk: From, ...args: Args) => Promise<To> | To} MapCallback
 * @template From, To
 * @template {Array<unknown>} Args
 */

/**
 * @typedef {{
 *   map: MapCallback<From, To, Args>
 *   concurrency?: number
 *   ordered?: boolean
 *   objectMode?: boolean
 * }|MapCallback<From, To, Args>} MapOptions
 * @template From, To
 * @template {Array<unknown>} Args
 */

/**
 * Processes chunks with a transform function
 *
 * @this {import('barnard59-core').Context}
 * @param {MapOptions<From, To, Args>} options Transform function or complex options
 * @param {Args} args Additional arguments to pass to the transform function
 * @return {import('stream').Transform}
 * @template From, To
 * @template {Array<unknown>} Args
 */
export default function map(options, ...args) {
  /**
   * @type {MapCallback<*, *, Args>}
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
      return func.call(this, data, ...args)
    }).then(result => {
      callback(null, result)
    }).catch(callback)
  })
}
