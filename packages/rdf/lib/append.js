import { Transform } from 'readable-stream'
import { localFetch } from './localFetch/localFetch.js'
import { applyOptions } from './metadata/applyOptions.js'

class MetadataAppend extends Transform {
  /**
   * @param {import('barnard59-core').Context} context
   * @param {string | undefined} basePath
   * @param {string | URL} input
   * @param {{
   *   dateCreated?: Date,
   *   dateModified?: Date,
   *   graph: undefined
   * }} options
   */
  constructor(context, basePath, input, options) {
    super({ objectMode: true })
    this.context = context
    this.basePath = basePath
    this.input = input
    this.options = options
  }

  /**
   * @param {import('@rdfjs/types').Quad} chunk
   * @param {string} encoding
   * @param {import('stream').TransformCallback} callback
   */
  _transform(chunk, encoding, callback) {
    callback(null, chunk)
  }

  /**
   * @param {import('stream').TransformCallback} callback
   */
  async _flush(callback) {
    try {
      const { quadStream, metadata } = await localFetch.call(this.context, this.input, this.basePath)
      for (const quad of await applyOptions(quadStream, metadata, this.options)) {
        this.push(quad)
      }
    } catch (/** @type {any} */ err) {
      this.destroy(err)
    } finally {
      callback()
    }
  }
}

/**
 * @this import('barnard59-core').Context
 * @param {object} [options]
 * @param {string | URL | undefined} [options.input]
 * @param {string} [options.basepath]
 * @param {Date} [options.dateModified]
 * @param {Date} [options.dateCreated]
 * @param {*} [options.graph]
 * @return {Promise<Transform>}
 */
async function append({
  input,
  basepath,
  dateModified = undefined,
  dateCreated = undefined,
  graph = undefined,
} = {}) {
  if (!input) {
    throw new Error('Needs input as parameter (url or filename)')
  }
  const basePath = this?.basePath ? this.basePath : basepath

  return new MetadataAppend(this, basePath, input, { graph, dateModified, dateCreated })
}

export default append
