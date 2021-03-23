import stream from 'readable-stream'

const { Writable } = stream

class ToContextStream extends Writable {
  constructor (result) {
    super({
      objectMode: true,
      write: (chunk, encoding, callback) => {
        result.push(chunk)

        callback()
      }
    })
  }
}

function factory () {
  return new ToContextStream(this.result)
}

export default factory
