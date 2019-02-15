const createBaseStream = require('./createBaseStream')

function nextLoop () {
  return new Promise(resolve => setTimeout(resolve, 0))
}

function createPipelineStream (pipeline) {
  let destroyed = false
  let firstStream = null
  let lastStream = null

  const stream = createBaseStream(pipeline, {
    init: async () => {
      await pipeline.init()

      // TODO: validate readable/writable

      firstStream = pipeline.streams[0]
      lastStream = pipeline.streams[pipeline.streams.length - 1]

      if (pipeline.readable) {
        lastStream.on('end', () => stream.push(null))
      }

      if (pipeline.writable) {
        const firstStream = pipeline.streams[0]

        stream.on('finish', () => firstStream.end())
      }
    },
    read: async (size) => {
      lastStream = pipeline.streams[pipeline.streams.length - 1]

      for (;;) {
        if (destroyed) {
          return
        }

        const chunk = lastStream.read(size)

        if (!chunk) {
          await nextLoop()
        } else if (!stream.push(chunk)) {
          return
        }
      }
    },
    write: (chunk, encoding, callback) => {
      firstStream.write(chunk, encoding, callback)
    },
    destroy: (err, callback) => {
      destroyed = true

      callback(err)
    }
  })

  stream._pipeline = pipeline

  stream.clone = pipeline.clone.bind(pipeline)

  const properties = ['basePath', 'context', 'node', 'variables']

  properties.forEach(property => {
    Object.defineProperty(stream, property, {
      get: () => pipeline[property],
      set: (value) => {
        pipeline[property] = value
      }
    })
  })

  return stream
}

module.exports = createPipelineStream
