const toReadable = require('duplex-to/readable')
const { PassThrough } = require('readable-stream')

function unpromiseReadable (promise) {
  const stream = new PassThrough({ objectMode: true })

  promise.then(source => {
    source.pipe(stream)
  }).catch(err => {
    stream.destroy(err)
  })

  return toReadable(stream)
}

module.exports = unpromiseReadable
