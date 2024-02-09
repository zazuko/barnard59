import mime from 'mime-types'

/**
 * @param {import('barnard59-env').Environment} env
 * @param {string | URL} fileUrl
 * @returns {import('@rdfjs/types').Sink<import('stream').EventEmitter, import('@rdfjs/types').Stream> | undefined}
 */
function getParserByExtension(env, fileUrl) {
  const mimeType = mime.lookup(fileUrl.toString())
  if (mimeType) {
    return env.formats.parsers.get(mimeType)
  }

  return undefined
}

export {
  getParserByExtension,
}
