const once = require('lodash/once')
const { Writable } = require('readable-stream')
const Queue = require('./Queue')
const RequestStream = require('./RequestStream')
const WhenDone = require('./WhenDone')

async function fetch ({ endpoint, ...options } = {}) {
  const queue = new Queue()
  const whenDone = new WhenDone()

  const makeRequest = once(() => {
    RequestStream.request(queue, endpoint, options, () => whenDone.done())
  })

  const stream = new Writable({
    objectMode: true,
    write: (quad, encoding, callback) => {
      queue.enqueue(quad, callback)
      makeRequest()
    },
    final: callback => {
      queue.enqueue(null, async () => whenDone.do(callback))
    }
  })

  return stream
}

module.exports = fetch
