import { isStream, isReadableStream } from 'is-stream'
import rdf from 'rdf-ext'
import SHACLValidator from 'rdf-validate-shacl'
import { Transform } from 'readable-stream'
import { buildErrorMessage } from './lib/buildErrorMessage.js'

class ValidateChunk extends Transform {
  constructor (shape, { maxErrors } = {}) {
    super({
      writableObjectMode: true,
      readableObjectMode: true
    })
    this.validator = new SHACLValidator(shape, { maxErrors })
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

export async function shacl (arg) {
  let shape
  let options
  let maxErrors = 1
  if (isStream(arg)) {
    shape = arg
  } else if (arg) {
    ({ shape, ...options } = arg)
    maxErrors = options.maxErrors < 1 ? undefined : Number(options.maxErrors)
  }

  if (!shape) {
    throw new Error('Needs a SHACL shape as parameter')
  }
  if (!isReadableStream(shape)) {
    throw new Error(`${shape} is not a readable stream`)
  }

  return new ValidateChunk(await rdf.dataset().import(shape), { maxErrors })
}
