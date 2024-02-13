import SFTP from 'ssh2-sftp-client'

class SftpClient {
  constructor({ host, port = 22, user, password, privateKey, passphrase, bufferSize = 64 * 1024 }) {
    this.host = host
    this.port = port
    this.user = user
    this.password = password
    this.privateKey = privateKey
    this.passphrase = passphrase
    this.bufferSize = bufferSize
    this.client = new SFTP()
  }

  async connect() {
    const options = {
      host: this.host,
      port: this.port,
      username: this.user,
      password: this.password,
      privateKey: this.privateKey,
      passphrase: this.passphrase,
    }

    await this.client.connect(options)
  }

  async disconnect() {
    this.client.end()
  }

  async list(path) {
    return this.client.list(path)
  }

  async move(source, target) {
    return this.client.rename(source, target)
  }

  async read(path) {
    return this.client.createReadStream(path)
  }

  async write(path) {
    return this.client.createWriteStream(path, {
      highWaterMark: this.bufferSize,
    })
  }
}

export default SftpClient
