const autoDestroy = require('./autoDestroy')
const { Writable } = require('readable-stream')

class WritablePipeline extends Writable {
  constructor (pipeline, init) {
    super({
      objectMode: pipeline.writableObjectMode,
      write: async (chunk, encoding, callback) => {
        await init(this)

        pipeline.write(chunk, encoding, callback)
      },
      destroy: (err, callback) => {
        pipeline.destroy(err, callback)
      }
    })

    autoDestroy(this)
  }
}

module.exports = WritablePipeline
