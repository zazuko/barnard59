const autoDestroy = require('./autoDestroy')
const { Readable } = require('readable-stream')

class ReadablePipeline extends Readable {
  constructor (pipeline, init) {
    super({
      objectMode: pipeline.readableObjectMode,
      read: async (size) => {
        await init(this)

        pipeline.read(size)
      },
      destroy: (err, callback) => {
        pipeline.destroy(err, callback)
      }
    })

    autoDestroy(this)
  }
}

module.exports = ReadablePipeline
