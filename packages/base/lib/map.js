const transform = require('parallel-transform')

/**
 * Processes chunks with a transform function
 *
 * @param {Object|Function} options Transform function or complex options
 * @params {Function} options.map Transform function
 * @param {Number} [options.concurrency=1] The max number of concurrent chunks being transformed
 * @param {Boolean} [options.ordered=true] Option to keep order of asynchronously transformed chunks
 * @param {Boolean} [options.objectMode=true] Option to transform chunks in object mode
 * @return {ReadableStream}
 */
function map (options) {
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
    }).then((result) => {
      callback(null, result)
    }).catch(callback)
  })
}

module.exports = map
