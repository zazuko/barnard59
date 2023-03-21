import { promises as fs } from 'fs'
import path from 'path'
import FtpClient from './FtpClient.js'
import SftpClient from './SftpClient.js'

async function command (options, callback, keepAlive = false) {
  const ClientClass = getClientClass(options.protocol)
  const privateKey = await getPrivateKey(options)
  const client = new ClientClass(
    privateKey ? { ...options, privateKey } : options)
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

async function maybeFromFile (str) {
  try {
    const absolutePath = path.resolve(str)
    await fs.access(absolutePath)
    return fs.readFile(absolutePath)
  } catch (err) {
    return undefined
  }
}

async function getPrivateKey ({ privateKey }) {
  if (privateKey && typeof privateKey === 'string') {
    const contents = await maybeFromFile(privateKey)
    return contents ?? privateKey
  }
  return privateKey
}

export default command
