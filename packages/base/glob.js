import { promisify } from 'util'
import globFn from 'glob'
import { Readable } from 'readable-stream'
import { once } from 'lodash-es'

export default function glob ({ pattern, ...options }) {
  let filenames = null

  const init = once(async () => {
    filenames = await promisify(globFn)(pattern, options)
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
