const command = require('./lib/command')
const { Transform } = require('readable-stream')

function move ({ source, target, ...options }) {
  return new Transform({
    flush: async callback => {
      await command(options, async client => {
        return client.move(source, target)
      })

      callback()
    },

    transform: (chunk, encoding, callback) => {
      callback(null, chunk)
    }
  })
}

module.exports = move
