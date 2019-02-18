const eventToPromise = require('./eventToPromise')
const { isReadable, isWritable } = require('isstream')

/**
 * Run a pipe.
 * @param {Stream} something
 * @return {Promise} something
 * @memberof module:barnard59
 * @example
 * ```js
 * p.run(source.pipe(p.limit).pipe(p.stdout())).then(() => {console.log('done')})
 * ```
 */
function run (something) {
  if (typeof something === 'function') {
    return Promise.resolve().then(() => {
      return something()
    })
  }

  if (isReadable(something) || isWritable(something)) {
    return run.stream(something)
  }

  return Promise.reject(new Error('unknown content'))
}

run.stream = function (stream) {
  return Promise.race([
    eventToPromise(stream, 'end'),
    eventToPromise(stream, 'finish'),
    eventToPromise(stream, 'error').reject()
  ])
}

module.exports = run
