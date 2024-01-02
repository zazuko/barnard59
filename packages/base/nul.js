// @ts-check
import { Writable } from 'readable-stream'

class Nul extends Writable {
  constructor() {
    super({ objectMode: true })
  }

  /**
   * @param {any} chunk
   * @param {string} encoding
   * @param {() => void} callback
   */
  _write(chunk, encoding, callback) {
    callback()
  }
}

/**
 * @return {import('readable-stream').Writable}
 */
function factory() {
  return new Nul()
}

export default factory
