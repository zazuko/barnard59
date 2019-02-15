const once = require('lodash/once')
const { Duplex, Readable, Writable } = require('readable-stream')

function createBaseStream (pipeline, { init, read, write, destroy } = {}) {
  const initOnce = once(init)

  if (pipeline.readable && pipeline.writable) {
    return new Duplex({
      readableObjectMode: pipeline.readableObjectMode,
      writableObjectMode: pipeline.writableObjectMode,
      read: async (size) => {
        await initOnce()

        read(size)
      },
      write: async (chunk, encoding, callback) => {
        await initOnce()

        write(chunk, encoding, callback)
      },
      destroy,
      autoDestroy: true
    })
  } else if (pipeline.readable) {
    return new Readable({
      objectMode: pipeline.readableObjectMode,
      read: async (size) => {
        await initOnce()

        read(size)
      },
      destroy,
      autoDestroy: true
    })
  } else if (pipeline.writable) {
    return new Writable({
      objectMode: pipeline.writableObjectMode,
      write: async (chunk, encoding, callback) => {
        await initOnce()

        write(chunk, encoding, callback)
      },
      destroy,
      autoDestroy: true
    })
  }

  // use the readable interface just to get the readable event to init and process the pipeline
  return new Readable({
    read: () => initOnce()
  })
}

module.exports = createBaseStream
