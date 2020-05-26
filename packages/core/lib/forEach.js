const { promisify } = require('util')
const { finished, Duplex } = require('readable-stream')
const { isWritable } = require('isstream')
const ReadableToReadable = require('readable-to-readable')

class ForEach extends Duplex {
  constructor ({ pipeline, master, log, variable }) {
    super({ objectMode: true })

    this.log = log
    this.child = pipeline
    this.master = master
    this.variable = variable
    this.pull = null
    this.done = false
  }

  async _write (chunk, encoding, callback) {
    try {
      const subPipeline = this.child.clone({
        basePath: this.master.basePath,
        context: this.master.context,
        objectMode: true,
        variables: this.master.variables,
        log: this.log
      })

      this.pull = ReadableToReadable.readFrom(subPipeline, { end: false })

      if (this.variable) {
        // if the argument is a function, call it with the chunk as argument
        if (typeof this.variable === 'function') {
          this.variable.call(undefined, subPipeline, chunk)
        }

        // if the argument is a string, assign the chunk to the variable with the argument as key
        if (typeof this.variable === 'string' && subPipeline.variables) {
          subPipeline.variables.set(this.variable, chunk)
        }
      }

      if (isWritable(subPipeline)) {
        subPipeline.end(chunk)
      }

      await promisify(finished)(subPipeline)

      this.pull = null

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

    if (this.pull && !await this.pull()) {
      return
    }

    setImmediate(() => this._read())
  }

  _final (callback) {
    this.done = true

    callback()
  }
}

function factory (pipeline, variable) {
  return new ForEach({
    pipeline,
    master: this.pipeline,
    log: this.log,
    variable
  })
}

module.exports = factory
