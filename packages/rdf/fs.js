import { Transform } from 'readable-stream'
import fromFile from 'rdf-utils-fs/fromFile.js'

export function parse() {
  return new Transform({
    objectMode: true,
    transform: async (path, encoding, callback) => {
      const fileStream = fromFile(path)

      fileStream.on('data', quad => callback(null, quad))
      fileStream.on('error', callback)
    },
  })
}
