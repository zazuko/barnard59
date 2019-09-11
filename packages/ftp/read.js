const command = require('./lib/command')
const { finished } = require('readable-stream')

async function read ({ filename, ...options }) {
  return command(options, async client => {
    const stream = await client.read(filename)

    finished(stream, () => {
      client.disconnect()
    })

    return stream
  }, true)
}

module.exports = read
