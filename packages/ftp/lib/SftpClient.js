import SFTP from 'sftp-promises'
import ftpParser from 'ftp/lib/parser.js'
const { parseListEntry } = ftpParser

class SftpClient {
  constructor ({ host, port = 22, user, password, privateKey, passphrase }) {
    this.host = host
    this.port = port
    this.user = user
    this.password = password
    this.privateKey = privateKey
    this.passphrase = passphrase
    this.client = new SFTP()
    this.session = null
  }

  async connect () {
    const options = {
      host: this.host,
      port: this.port,
      username: this.user,
      password: this.password,
      privateKey: this.privateKey,
      passphrase: this.passphrase
    }

    this.session = await this.client.session(options)

    return this.session
  }

  async disconnect () {
    if (this.session) {
      return this.session.end()
    }
  }

  async list (path) {
    return this.client.ls(path, this.session).then(result => {
      return result.entries.map(entry => parseListEntry(entry.longname))
    })
  }

  async move (source, target) {
    return this.client.mv(source, target, this.session)
  }

  async read (path) {
    return createReadStream(this.client, path, this.session)
  }

  async write (path) {
    throw new Error('Not implemented')
  }
}

export default SftpClient

// Copied from sftp-promises
// Fixed to resolve the promise directly instead of waiting `on('readable')`.
async function createReadStream (client, path, session) {
  var createReadStreamCmd = function (resolve, reject, conn) {
    return function (err, sftp) {
      if (err) { return reject(err) }
      sftp.stat(path, function (err, stat) {
        if (err) { return reject(err) }
        var bytes = stat.size
        if (bytes > 0) {
          bytes -= 1
        }
        try {
          var stream = sftp.createReadStream(path, { start: 0, end: bytes })
        } catch (err) {
          return reject(err)
        }
        stream.on('close', function () {
          // if there is no session we need to clean the connection
          if (!session) {
            conn.end()
            conn.destroy()
          }
        })
        stream.on('error', function () {
          if (!session) {
            conn.end()
            conn.destroy()
          }
        })

        resolve(stream)
      })
    }
  }
  return client.sftpCmd(createReadStreamCmd, session, true)
}
