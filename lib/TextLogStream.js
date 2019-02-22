const Transform = require('readable-stream').Transform

class TextLogStream extends Transform {
  constructor () {
    super({ objectMode: true })
  }

  _transform (chunk, e, next) {
    this.push(`${chunk.level} ${chunk.stack[0]} ${chunk.message}\r\n`)
    next()
  }
}

module.exports = TextLogStream
