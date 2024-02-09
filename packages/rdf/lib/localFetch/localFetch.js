import fsp from 'node:fs/promises'
import { resolve } from 'node:path'
import { pathToFileURL } from 'node:url'
import rdfFetch from '@rdfjs/fetch'
import fileFetch from 'file-fetch'
import { isReadableStream } from 'is-stream'
import protoFetch from 'proto-fetch'
import { getParserByExtension } from './lookupParser.js'

/**
 * @typedef {{
 *   type: string;
 *   value?: string | URL;
 *   stats?: import('fs').Stats;
 * }} Metadata
 */

/**
 * @typedef {{metadata: Metadata, quadStream: import('@rdfjs/types').Stream}} LocalFetchResponse
 */

/**
 * @param {import('@rdfjs/types').Stream} input
 * @return {LocalFetchResponse}
 */
function streamWithMetadata(input) {
  return {
    quadStream: input,
    metadata: {
      type: input.constructor.name,
    },
  }
}

/**
 * @param {string} input
 * @return {Promise<LocalFetchResponse>}
 */
async function fetchHTTPWithMeta(input) {
  const url = new URL(input, import.meta.url)
  const res = await rdfFetch(url)
  return {
    quadStream: await res.quadStream(),
    metadata: {
      type: url.constructor.name,
      value: url,
    },
  }
}

/**
 * @param {import('barnard59-env').Environment} env
 * @param {string} filePath
 */
function guessParserForFile(env, filePath) {
  const parser = getParserByExtension(env, filePath)
  if (!parser) {
    throw new Error(`No parser could be guessed for ${filePath}`)
  }
  return parser
}

/**
 * @param {import('barnard59-env').Environment} env
 * @param {string} input
 * @return {Promise<LocalFetchResponse>}
 */
async function fetchFileWithMeta(env, input) {
  const filePathURL = new URL(input, import.meta.url)
  const res = await fileFetch(filePathURL.toString())
  /**
   * @type {any}
   */
  const stream = res.body
  const quadStream = await guessParserForFile(env, input).import(stream)
  return {
    quadStream,
    metadata: {
      type: filePathURL.constructor.name,
      value: filePathURL.toString(),
      stats: await fsp.lstat(filePathURL),
    },
  }
}

/**
 * Tries to fetch or read locally one file
 * @this import('barnard59-core').Context
 * @param {import('stream').Readable | string} input
 * @param {string} [basePath]
 * @return {Promise<LocalFetchResponse>}
 */
async function localFetch(
  input,
  basePath,
) {
  if (!(input)) {
    throw new Error('needs input filename or URL')
  }
  if (isReadableStream(input)) {
    return streamWithMetadata(input)
  }
  if (typeof input !== 'string') {
    throw new Error(`needs input filename or URL, got [${typeof input}]`)
  }
  /**
   * @type {(input: (string | URL)) => Promise<LocalFetchResponse>}
   */
  // @ts-expect-error
  const fetch = protoFetch({
    file: fetchFileWithMeta.bind(null, this.env),
    http: fetchHTTPWithMeta,
    https: fetchHTTPWithMeta,
  })

  try {
    return fetch(new URL(input).toString())
  } catch {
    // in case of error, the input must be path string
    const absolutePath = basePath ? resolve(basePath, input) : input

    return fetch(pathToFileURL(absolutePath).toString())
  }
}

export { localFetch }
