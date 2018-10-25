const path = require('path')
const url = require('url')

const isUrl = new RegExp('^[a-z]*://')

function parseIri (iri) {
  if (isUrl.test(iri)) {
    return url.parse(iri)
  }

  const colonIndex = iri.indexOf(':')

  if (colonIndex === -1) {
    throw new Error(`can't determinate schema of: ${iri}`)
  }

  let hashIndex = iri.indexOf('#')

  if (hashIndex === -1) {
    hashIndex = iri.length
  }

  return {
    protocol: iri.substring(0, colonIndex + 1),
    path: iri.substring(colonIndex + 1, hashIndex),
    hash: hashIndex === iri.length ? null : iri.substring(hashIndex)
  }
}

const resolver = {
  null: parts => parts.path,
  'file:': (parts, basePath) => {
    if (parts.path.substring(0, 1) === '/') {
      return parts.path
    }

    return path.join(basePath, parts.path)
  },
  'node:': parts => parts.path
}

function iriRequire (iri, basePath) {
  const parts = parseIri(iri)

  if (!resolver[parts.protocol]) {
    throw new Error(`unknown protocol: ${parts.protocol}`)
  }

  const filename = resolver[parts.protocol](parts, basePath)
  const method = parts.hash && parts.hash.substring(1)

  const result = require(filename)

  if (!method) {
    return result
  }

  // split method name by . for deep structures
  return method.split('.').reduce((result, property) => result[property], result)
}

module.exports = iriRequire
