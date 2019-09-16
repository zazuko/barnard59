const SFTP = require('sftp-promises')
const FileParser = require('ftp/lib/parser')

class SftpClient {
  constructor ({ host, port = 21, user, password }) {
    this.host = host
    this.port = port
    this.user = user
    this.password = password
    this.client = new SFTP()
    this.session = null
  }

  async connect () {
    this.session = await this.client.session({
      host: this.host,
      port: this.port,
      username: this.user,
      password: this.password
    })

    return this.session
  }

  async disconnect () {
    if (this.session) {
      return this.session.end()
    }
  }

  async list (path) {
    return this.client.ls(path, this.session).then(result => {
      return result.entries.map(entry => FileParser.parseListEntry(entry.longname))
    })
  }

  async move (source, target) {
    return this.client.mv(source, target, this.session)
  }

  async read (path) {
    return this.client.createReadStream(path, this.session)
  }

  async write (path) {
    throw new Error('Not implemented')
  }
}

module.exports = SftpClient
