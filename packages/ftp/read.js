import { finished } from 'readable-stream'
import command from './lib/command.js'

async function read ({ filename, ...options }) {
  return command(options, async client => {
    const stream = await client.read(filename)

    finished(stream, () => {
      client.disconnect()
    })

    return stream
  }, true)
}

export default read
