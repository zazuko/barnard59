const { Duplex } = require('readable-stream')

class DuplexPipeline extends Duplex {
  constructor (pipeline, init) {
    super({
      readableObjectMode: pipeline.readableObjectMode,
      writableObjectMode: pipeline.writableObjectMode,
      read: async (size) => {
        await init(this)

        pipeline.read(size)
      },
      write: async (chunk, encoding, callback) => {
        await init(this)

        pipeline.write(chunk, encoding, callback)
      },
      destroy: (err, callback) => {
        pipeline.destroy(err, callback)
      },
      autoDestroy: true
    })
  }
}

module.exports = DuplexPipeline
