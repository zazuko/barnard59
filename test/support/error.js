const { Readable } = require('readable-stream')

function error () {
  const stream = new Readable({
    read: () => {
      stream.destroy(new Error('test'))
    }
  })

  return stream
}

module.exports = error
