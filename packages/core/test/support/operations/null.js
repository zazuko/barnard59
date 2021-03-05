import stream from 'readable-stream'

const { Writable } = stream

class NullStream extends Writable {
  constructor () {
    super({
      objectMode: true,
      write: (chunk, encoding, callback) => callback()
    })
  }
}

function factory () {
  return new NullStream()
}

export default factory
