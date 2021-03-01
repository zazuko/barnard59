import { Writable } from 'readable-stream'

class Nul extends Writable {
  constructor () {
    super({ objectMode: true })
  }

  _write (chunk, encoding, callback) {
    callback()
  }

  static create () {
    return new Nul()
  }
}

const nul = Nul.create

export default nul
