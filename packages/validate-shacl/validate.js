import rdf from 'rdf-ext'
import SHACLValidator from 'rdf-validate-shacl'
import { Transform } from 'readable-stream'
import { buildErrorMessage } from './lib/buildErrorMessage.js'
import stream from 'stream'

class ValidateChunk extends Transform {
  constructor (shape) {
    super({
      writableObjectMode: true,
      readableObjectMode: true
    })
    this.validator = new SHACLValidator(shape, { maxErrors: 1 })
  }

  _transform (chunk, encoding, callback) {
    const report = this.validator.validate(chunk)
    if (!report.conforms) {
      const errorMessage = buildErrorMessage(report)
      this.destroy(new Error(errorMessage))
    } else {
      callback(null, chunk)
    }
  }
}

function isReadableStream (obj) {
  return obj instanceof stream.Stream &&
    typeof (obj._read === 'function') &&
    typeof (obj._readableState === 'object')
}

export async function shacl (shape) {
  if (!shape) {
    throw new Error(`Needs a SHACL shape as parameter`)
  } else if (isReadableStream(shape)) {
    return new ValidateChunk(await rdf.dataset().import(shape))
  } else {
    throw new Error(`${shape} is not a readable stream`)
  }
}