import { promisify } from 'util'
import Ftp from 'ftp'
import { PassThrough, Readable, Writable } from 'readable-stream'

class FtpClient {
  constructor ({ host, port = 21, user, password }) {
    this.host = host
    this.port = port
    this.user = user
    this.password = password
    this.client = new Ftp()
  }

  async connect () {
    this.client.connect({
      host: this.host,
      port: this.port,
      user: this.user,
      password: this.password
    })

    return new Promise((resolve, reject) => {
      this.client.once('ready', resolve)
      this.client.once('error', reject)
    })
  }

  async disconnect () {
    this.client.end()

    return new Promise(resolve => {
      this.client.once('close', resolve)
    })
  }

  async list (path) {
    return promisify(this.client.list.bind(this.client))(path)
  }

  async move (source, target) {
    return promisify(this.client.rename.bind(this.client))(source, target)
  }

  async read (path) {
    return new Readable().wrap(await promisify(this.client.get.bind(this.client))(path))
  }

  async write (path) {
    const output = new PassThrough()
    const input = new Writable({
      final (callback) {
        output.end(callback)
      },
      write (chunk, encoding, callback) {
        output.write(chunk, encoding, callback)
      }
    })

    const finished = require('readable-stream').finished

    finished(output, () => {
      console.log('finished')
    })

    this.client.put(output, path, err => {
      if (err) {
        input.emit('error', err)
      }
    })

    return input
  }
}

export default FtpClient
