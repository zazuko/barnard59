const command = require('./lib/command')
const path = require('path')
const { Readable } = require('readable-stream')

async function list ({ pathname, ...options }) {
  const files = await command(options, async client => {
    return client.list(pathname)
  })

  const filenames = files.filter(file => file.type === '-').map(file => path.join(pathname, file.name))

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

module.exports = list
