import { Transform } from 'readable-stream'
import { localFetch } from './localFetch/localFetch.js'
import { applyOptions } from './metadata/applyOptions.js'

class MetadataAppend extends Transform {
  constructor (context, basePath, input, options) {
    super({ objectMode: true })
    this.context = context
    this.basePath = basePath
    this.input = input
    this.options = options
  }

  _transform (chunk, encoding, callback) {
    callback(null, chunk)
  }

  async _flush (callback) {
    try {
      const { quadStream, metadata } = await localFetch(this.input, this.basePath)
      for (const quad of await applyOptions(quadStream, metadata, this.options)) {
        this.push(quad)
      }
    } catch (err) {
      this.destroy(err)
    } finally {
      callback()
    }
  }
}

async function append ({
  input,
  basepath,
  dateModified = undefined,
  dateCreated = undefined,
  graph = undefined
} = {}) {
  if (!input) {
    throw new Error('Needs input as parameter (url or filename)')
  }
  const basePath = this?.context?.basePath ? this.context.basePath : basepath

  return new MetadataAppend(this, basePath, input, { graph, dateModified, dateCreated })
}

export default append
