import stream from 'node:stream'

const { Readable } = stream

class ErrorStream extends Readable {
  _read() {
    this.destroy(new Error('test'))
  }
}

function factory() {
  return new ErrorStream()
}

export default factory
