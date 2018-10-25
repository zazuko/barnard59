const Transform = require('readable-stream').Transform

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

  static create () {
    return new JsonSerializer()
  }
}

module.exports = JsonSerializer.create
