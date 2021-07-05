import { dirname } from 'path'
import FtpSrv from 'ftp-srv'

const __dirname = dirname(new URL(import.meta.url).pathname)

class FtpServer {
  constructor ({ path = __dirname, user, password } = {}) {
    this.port = 8020
    this.path = path
    this.user = user
    this.password = password

    this.server = new FtpSrv({
      url: `ftp://localhost:${this.port}`,
      pasv_url: 'localhost',
      anonymous: !this.user
    })

    this.server.log.streams[0].level = 1000
  }

  get options () {
    return {
      protocol: 'ftp',
      host: 'localhost',
      port: this.port,
      user: this.user || 'anonymous',
      password: this.password
    }
  }

  async start () {
    this.server.on('login', ({ connection, username, password }, resolve, reject) => {
      if (this.user) {
        if (username !== this.user || password !== this.password) {
          return reject(new Error('invalid user or password'))
        }
      } else {
        if (username !== 'anonymous') {
          return reject(new Error('only anonymous access allowed'))
        }
      }

      resolve({ root: this.path })
    })

    await this.server.listen()
  }

  async stop () {
    await this.server.close()
  }
}

export default FtpServer
