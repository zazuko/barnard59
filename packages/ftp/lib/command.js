const FtpClient = require('./FtpClient')
const SftpClient = require('./SftpClient')

async function command (options, callback, keepAlive = false) {
  const ClientClass = getClientClass(options.protocol)
  const client = new ClientClass(options)
  await client.connect()

  try {
    const result = await callback(client)

    if (!keepAlive) {
      await client.disconnect()
    }

    return result
  } catch (err) {
    await client.disconnect()
    throw err
  }
}

function getClientClass (protocol = 'ftp') {
  switch (protocol) {
    case 'ftp': return FtpClient
    case 'sftp': return SftpClient
    default: throw Error(`Invalid protocol ${protocol}`)
  }
}

module.exports = command
