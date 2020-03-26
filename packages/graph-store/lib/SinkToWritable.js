const { promisify } = require('util')
const once = require('lodash/once')
const defer = require('promise-the-world/defer')
const { finished, Readable, Writable } = require('readable-stream')

class SinkToWritable extends Writable {
  constructor (factory) {
    super({
      objectMode: true,
      write: (chunk, encoding, callback) => {
        init()

        if (read) {
          read = readable.push(chunk)

          callback()
        } else {
          setTimeout(() => this._write(chunk, encoding, callback), 0)
        }
      },
      final: async callback => {
        readable.push(null)

        try {
          await isFinished
          await returned.promise
        } catch (err) {
          return callback(err)
        }

        callback()
      }
    })

    const init = once(async () => {
      try {
        await factory(readable)
      } catch (err) {
        return returned.reject(err)
      }

      returned.resolve()
    })

    const readable = new Readable({
      objectMode: true,
      read: () => {
        read = true
      }
    })

    let read = false
    const isFinished = promisify(finished)(readable)
    const returned = defer()
  }
}

module.exports = SinkToWritable
