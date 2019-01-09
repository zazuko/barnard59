const Readable = require('readable-stream').Readable
const Transform = require('readable-stream').Transform
const isWritable = require('isstream').isWritable
const run = require('./run')
const eventToPromise = require('./eventToPromise')

class ObjectToReadable extends Readable {
  constructor (content) {
    super({
      objectMode: true,
      read: () => {}
    })

    this.push(content)
    this.push(null)
  }
}

class ForEach extends Transform {
  constructor (pipeline, master, log, handleChunk) {
    super({ objectMode: true })

    this.log = log
    this.child = pipeline
    this.master = master
    this.handleChunk = handleChunk
  }

  _transform (chunk, encoding, callback) {
    const current = this.child.clone({
      ...this.master,
      objectMode: true,
      log: this.log
    })

    this.runPipeline(chunk, current)
      .then(() => callback())
      .catch(err => callback(err))

    current.on('data', chunk => this.push(chunk))
    current.on('error', cause => {
      const err = new Error(`error in forEach sub-pipeline ${this.child.node.value}`)

      err.stack += `\nCaused by: ${cause.stack}`

      callback(err)
    })
  }

  runPipeline (chunk, pipeline) {
    if (this.handleChunk) {
      this.handleChunk.call(undefined, pipeline, chunk)
    }

    return pipeline.init().then(() => {
      if (!isWritable(pipeline.streams[0])) {
        return run(pipeline.streams[0])
      } else {
        const item = new ObjectToReadable(chunk)
        return eventToPromise(item.pipe(pipeline.streams[0]), 'end')
      }
    })
  }

  static create (pipeline, handleChunk) {
    return new ForEach(pipeline, this.pipeline, this.log, handleChunk)
  }
}

module.exports = ForEach.create
