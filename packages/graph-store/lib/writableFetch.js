const once = require('lodash/once')
const { Writable } = require('readable-stream')
const Queue = require('./Queue')
const RequestStream = require('./RequestStream')

async function fetch ({ endpoint, method, ...options } = {}) {
  const queue = new Queue()

  const makeRequest = once(() => {
    RequestStream.request(queue, endpoint, method, options)
  })

  const stream = new Writable({
    objectMode: true,
    write: (quad, encoding, callback) => {
      queue.enqueue(quad, callback)
      makeRequest()
    },
    final: callback => {
      queue.enqueue(null, callback)
    }
  })

  return stream
}

module.exports = fetch
