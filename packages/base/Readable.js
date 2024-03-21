import Readable from 'readable-stream'

/**
 * @param {any[]} array
 * @return {ReturnType<Readable.from>}
 */
export function from(...array) {
  return Readable.from(array)
}
