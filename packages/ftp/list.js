import { join } from 'path'
import { Readable } from 'readable-stream'
import command from './lib/command.js'

async function list ({ pathname, ...options }) {
  const files = await command(options, async client => {
    return client.list(pathname)
  })

  const filenames = files.filter(file => file.type === '-').map(file => join(pathname, file.name))

  const stream = new Readable({
    objectMode: true,
    read: () => {
      for (const filename of filenames) {
        stream.push(filename)
      }

      stream.push(null)
    }
  })

  return stream
}

export default list
