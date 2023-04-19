import { Writable } from 'readable-stream'

class Nul extends Writable {
  constructor () {
    super({ objectMode: true })
  }

  _write (chunk, encoding, callback) {
    callback()
  }
}

function factory () {
  return new Nul()
}

export default factory
