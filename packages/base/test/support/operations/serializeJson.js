import stream from 'readable-stream'

const { Transform } = stream

class JsonSerializer extends Transform {
  constructor () {
    super({ writableObjectMode: true })

    this.first = true
  }

  _transform (chunk, encoding, callback) {
    if (this.first) {
      this.push('[\n')

      this.first = false
    } else {
      this.push(',\n')
    }

    this.push(JSON.stringify(chunk))

    callback()
  }

  _flush (callback) {
    this.push('\n]')

    callback()
  }
}

function factory () {
  return new JsonSerializer()
}

export default factory
