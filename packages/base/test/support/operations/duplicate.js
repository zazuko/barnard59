import stream from 'readable-stream'

const { Transform } = stream

class Duplicator extends Transform {
  constructor () {
    super({ objectMode: true })
  }

  _transform (chunk, encoding, callback) {
    this.push(chunk)
    this.push(chunk)

    callback()
  }
}

function factory () {
  return new Duplicator()
}

export default factory
