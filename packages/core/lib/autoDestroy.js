const { finished } = require('readable-stream')

function autoDestroy (stream) {
  finished(stream, () => {
    stream.destroy()
  })
}

module.exports = autoDestroy
