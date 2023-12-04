import mime from 'mime-types'

function getParserByExtension(env, fileUrl) {
  const mimeType = mime.lookup(fileUrl.toString())
  return env.formats.parsers.get(mimeType)
}

export {
  getParserByExtension,
}
