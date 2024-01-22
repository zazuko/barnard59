import { Transform } from 'readable-stream'

/**
 * @this {import('barnard59-core').Context}
 * @return {Transform}
 */
export function parse() {
  const { env } = this

  return new Transform({
    objectMode: true,
    transform: async function (path, encoding, callback) {
      try {
        /**
         * @type {import('@rdfjs/types').Stream}
         */
        const fileStream = env.fromFile(path)

        let failed = false
        fileStream.on('data', /** @type {import('@rdfjs/types').Quad} */ quad => this.push(quad))
        fileStream.on('error', (/** @type {any} */ e) => {
          callback(e)
          failed = true
        })
        fileStream.on('end', () => !failed && callback())
      } catch (/** @type {any} */ e) {
        callback(e)
      }
    },
  })
}
