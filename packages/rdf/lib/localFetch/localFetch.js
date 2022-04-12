import fs from 'fs'
import fsp from 'fs/promises'

import { resolve } from 'path'
import rdfFetch from '@rdfjs/fetch'
import isStream, { isReadable } from 'isstream'
import { getParserByExtension } from './lookupParser.js'

function isReadableStream (arg) {
  return isStream(arg) && isReadable(arg)
}

function isFileProtocol (url) {
  return (url.protocol === 'file:')
}

function isHTTP (url) {
  return (url.protocol === 'https:' || url.protocol === 'http:')
}

// Tries to fetch or read locally one file
async function localFetch (
  input,
  basePath
) {
  if (!(input)) {
    throw new Error('needs input filename or URL')
  }

  if (isReadableStream(input)) {
    return { quadStream: input, metadata: {} }
  }

  if (typeof input !== 'string') {
    throw new Error(`needs input filename or URL, got [${typeof input}]`)
  }

  const url = new URL(input, import.meta.url)
  if (isHTTP(url)) {
    const res = await rdfFetch(url)
    return {
      quadStream: await res.quadStream(),
      metadata: {
        uri: url
      }
    }
  }

  if (!isFileProtocol(new URL(input, import.meta.url))) {
    throw new Error(`Could not load ${input}`)
  }

  const filePath = input.startsWith('file://') ? input : (basePath ? resolve(basePath, input) : input)

  const filePathURL = new URL(filePath, import.meta.url)

  const stream = fs.createReadStream(filePathURL)
  const parser = getParserByExtension(filePath)
  if (!parser) {
    throw new Error(`No parser could be guessed for ${filePath}`)
  }
  const quadStream = await parser.import(stream)
  return {
    quadStream: quadStream,
    metadata: {
      stats: await fsp.lstat(filePathURL),
      uri: filePathURL.toString()
    }
  }
}

export { localFetch }
