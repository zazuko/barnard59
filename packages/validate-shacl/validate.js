import { isStream, isReadableStream } from 'is-stream'
import rdf from 'rdf-ext'
import SHACLValidator from 'rdf-validate-shacl'
import { Transform } from 'readable-stream'
import { buildErrorMessage } from './lib/buildErrorMessage.js'

class ValidateChunk extends Transform {
  constructor (context, shape, { maxErrors, onViolation } = {}) {
    super({
      writableObjectMode: true,
      readableObjectMode: true
    })
    this.context = context
    this.onViolation = onViolation
    this.validator = new SHACLValidator(shape, { maxErrors })
  }

  _transform (data, encoding, callback) {
    const report = this.validator.validate(data)
    let shouldContinue = report.conforms

    if (!shouldContinue && typeof this.onViolation === 'function') {
      shouldContinue = this.onViolation({
        context: this.context,
        report,
        data,
      })
    }

    if (shouldContinue) {
      return callback(null, data)
    }

    const errorMessage = buildErrorMessage(report)
    this.destroy(new Error(errorMessage))
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

  return new ValidateChunk(this, await rdf.dataset().import(shape), { ...options, maxErrors })
}
