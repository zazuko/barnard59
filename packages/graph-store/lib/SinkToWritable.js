import { promisify } from 'util'
import once from 'lodash/once.js'
import defer from 'promise-the-world/defer.js'
import { finished, Readable, Writable } from 'readable-stream'

class SinkToWritable extends Writable {
  constructor (factory) {
    super({
      objectMode: true,
      write: async (chunk, encoding, callback) => {
        init()

        await read.promise

        if (!readable.push(chunk)) {
          read = defer()
        }

        callback()
      },
      final: async callback => {
        init()

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
        read.resolve()
      }
    })

    let read = defer()
    const isFinished = promisify(finished)(readable)
    const returned = defer()
  }
}

export default SinkToWritable
