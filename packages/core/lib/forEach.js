const { promisify } = require('util')
const { finished, Duplex, Readable } = require('readable-stream')
const { isWritable } = require('isstream')
const ReadableToReadable = require('readable-to-readable')

function objectToReadable (content, objectMode) {
  const stream = new Readable({
    objectMode,
    read: () => {}
  })

  stream.push(content)
  stream.push(null)

  return stream
}

class ForEach extends Duplex {
  constructor (pipeline, master, log, handleChunk) {
    super({ objectMode: true })

    this.log = log
    this.child = pipeline
    this.master = master
    this.handleChunk = handleChunk
    this.readFrom = null
    this.done = false
  }

  async _write (chunk, encoding, callback) {
    try {
      const current = this.child.clone({
        ...this.master,
        objectMode: true,
        log: this.log
      })

      this.readFrom = ReadableToReadable.readFrom(current, { end: false })

      if (this.handleChunk) {
        this.handleChunk.call(undefined, current, chunk)
      }

      if (isWritable(current)) {
        objectToReadable(chunk, current._writableState.objectMode).pipe(current)
      }

      await promisify(finished)(current)

      this.readFrom = null

      return callback()
    } catch (cause) {
      const err = new Error(`error in forEach sub-pipeline ${this.child.node.value}`)

      err.stack += `\nCaused by: ${cause.stack}`

      return callback(err)
    }
  }

  async _read () {
    if (this.done) {
      return this.push(null)
    }

    if (this.readFrom && !await this.readFrom()) {
      return
    }

    setTimeout(() => this._read(), 0)
  }

  _final (callback) {
    this.done = true

    callback()
  }

  static create (pipeline, handleChunk) {
    return new ForEach(pipeline, this.pipeline, this.log, handleChunk)
  }
}

module.exports = ForEach.create
