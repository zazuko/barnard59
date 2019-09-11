const FtpClient = require('./FtpClient')

async function command (options, callback, keepAlive = false) {
  const client = new FtpClient(options)
  await client.connect()

  try {
    const result = await callback(client)

    if (!keepAlive) {
      await client.disconnect()
    }

    return result
  } catch (err) {
    return client.disconnect()
  }
}

module.exports = command
