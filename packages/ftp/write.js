import { finished } from 'readable-stream'
import command from './lib/command.js'

export default async function write({ filename, ...options }) {
  return command(options, async client => {
    const stream = await client.write(filename)

    finished(stream, () => {
      client.disconnect()
    })

    return stream
  }, true)
}
