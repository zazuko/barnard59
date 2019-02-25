const autoDestroy = require('./autoDestroy')
const { Readable } = require('readable-stream')

class PlainPipeline extends Readable {
  constructor (pipeline, init) {
    super({
      objectMode: pipeline.readableObjectMode,
      read: async () => {
        await init(this)
      },
      destroy: (err, callback) => {
        pipeline.destroy(err, callback)
      }
    })

    autoDestroy(this)
  }
}

module.exports = PlainPipeline
