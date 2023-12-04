import { Transform } from 'readable-stream'

export function parse() {
  const { env } = this

  return new Transform({
    objectMode: true,
    transform: async function (path, encoding, callback) {
      try {
        const fileStream = env.fromFile(path)

        let failed = false
        fileStream.on('data', quad => this.push(quad))
        fileStream.on('error', (e) => {
          callback(e)
          failed = true
        })
        fileStream.on('end', () => !failed && callback())
      } catch (e) {
        callback(e)
      }
    },
  })
}
