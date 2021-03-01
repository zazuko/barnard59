import express from 'express'

import { promisify } from 'util'

export class ExpressServer {
  constructor () {
    this.app = express()
  }

  async start () {
    await (new Promise((resolve, reject) => {
      this.server = this.app.listen(err => {
        if (err) {
          return reject(err)
        }

        resolve()
      })
    }))

    return this.url
  }

  async stop () {
    await promisify(this.server.close.bind(this.server))()
  }

  get url () {
    return `http://localhost:${this.server.address().port}/`
  }
}
