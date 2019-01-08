const run = require('../../lib/run')

/**
 * @callback requestCallback
 * @param {*} output
 * @param {*} chunk
 * @returns {*} chunk
 */

/**
 * Runs a pipeline and combines chunks
 *
 * @param pipe
 * @param initialValue
 * @param {requestCallback} appendChunk optional function to append to the outpu
 * @returns {Promise<*>}
 */
module.exports = async function (pipe, initialValue = '', appendChunk = null) {
  let returnValue = initialValue

  appendChunk = appendChunk || function (chunk, current) {
    return current + chunk
  }

  pipe.on('data', (chunk) => {
    returnValue = appendChunk(chunk, returnValue)
  })

  pipe.context.log.on('data', log => {
    console.log(log.level, log.stack[0], log.message, '\n  ', log.stack.slice(1).join(' -> '))
  })

  await run(pipe)

  return returnValue
}
