import { Transform } from 'readable-stream'
import command from './lib/command.js'

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

export default move
