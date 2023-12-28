// @ts-check
import { createWriteStream } from 'node:fs'
import { Writable } from 'node:stream'

/**
 * Create a writable stream from a path.
 *
 * @param {string} path Path to write to.
 * @returns {WritableStream} Writable stream.
 */
export const createWritableStream = (path) => {
  const stream = createWriteStream(path)
  return Writable.toWeb(stream)
}
