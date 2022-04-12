import defaultFormats from '@rdfjs/formats-common'
import mime from 'mime-types'

function getParserByExtension (fileUrl) {
  const mimeType = mime.lookup(fileUrl.toString())
  return defaultFormats.parsers.get(mimeType)
}

export {
  getParserByExtension
}
