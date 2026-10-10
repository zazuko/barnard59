import { Transform } from 'node:stream'
import command from './lib/command.js'

function move({ source, target, ...options }) {
  return new Transform({
    objectMode: true,
    flush: async callback => {
      await command(options, async client => {
        return client.move(source, target)
      })

      callback()
    },

    transform: (chunk, encoding, callback) => {
      callback(null, chunk)
    },
  })
}

export default move
