import command from './lib/command.js'
import { finished } from 'readable-stream'

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
