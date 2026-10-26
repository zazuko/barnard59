import command from './lib/command.js'

async function read({ filename, ...options }) {
  return command(options, async client => {
    const stream = await client.read(filename)

    stream.on('close', () => {
      client.disconnect()
    })

    return stream
  }, true)
}

export default read
