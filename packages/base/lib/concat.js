const { finished, Readable } = require('readable-stream')

class ConcatStream extends Readable {
  constructor (streams, { objectMode = false } = {}) {
    super({ objectMode })

    this.streams = streams
    this.current = null

    this.next()
  }

  _read () {
    if (!this.current) {
      return this.push(null)
    }

    const chunk = this.current.read()

    if (!chunk) {
      return setTimeout(() => this._read(), 0)
    }

    if (this.push(chunk)) {
      this._read()
    }
  }

  next () {
    this.current = this.streams.shift()

    if (this.current) {
      this.current.on('error', err => this.destroy(err))

      finished(this.current, () => this.next())
    }
  }
}

function factory (...streams) {
  return new ConcatStream(streams)
}

factory.object = (...streams) => {
  return new ConcatStream(streams, { objectMode: true })
}

module.exports = factory
