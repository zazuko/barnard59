const { promisify } = require('util')
const glob = require('glob')
const once = require('lodash/once')
const { Readable } = require('readable-stream')

function factory ({ pattern, ...options }) {
  let filenames = null

  const init = once(async () => {
    filenames = await promisify(glob)(pattern, options)
  })

  const stream = new Readable({
    objectMode: true,
    read: async () => {
      try {
        await init()

        if (filenames.length === 0) {
          return stream.push(null)
        }

        if (!stream.push(filenames.shift())) {
          return
        }

        stream._read()
      } catch (err) {
        stream.destroy(err)
      }
    }
  })

  return stream
}

module.exports = factory
