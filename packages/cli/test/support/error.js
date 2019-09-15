const { Readable } = require('readable-stream')

function error () {
  const stream = new Readable({
    read: () => {
      stream.emit('error', new Error('test'))
    }
  })

  return stream
}

module.exports = error
