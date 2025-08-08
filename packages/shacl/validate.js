import { isStream, isReadableStream } from 'is-stream'
import SHACLValidator from 'rdf-validate-shacl'
import { Transform } from 'readable-stream'
import { ValidationError } from './lib/errors.js'

/**
 * @callback OnViolation
 * @param {object} options
 * @param {import('barnard59-core').Context} options.context
 * @param {import('rdf-validate-shacl/src/validation-report').ValidationReport} options.report
 * @param {import('@rdfjs/types').DatasetCore} options.data
 * @returns {boolean}
 */

class ValidateChunk extends Transform {
  /**
   * @param {import('barnard59-core').Context} context
   * @param {import('@rdfjs/types').DatasetCore} shape
   * @param {{ maxErrors?: number, onViolation?: OnViolation }} options
   */
  constructor(context, shape, { maxErrors, onViolation } = {}) {
    super({
      writableObjectMode: true,
      readableObjectMode: true,
    })
    this.context = context
    this.onViolation = onViolation
    this.validator = new SHACLValidator(shape, { maxErrors, factory: context.env })
  }

  /**
   * @param {import('@rdfjs/types').DatasetCore} data
   * @param {BufferEncoding} encoding
   * @param {(error?: Error | null, chunk?: unknown) => void} callback
   */
  _transform(data, encoding, callback) {
    this.validator.validate(data).then(report => {
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
      // @ts-ignore
      this.destroy(new ValidationError(report, this.validator.$shapes.dataset, data))
    })
  }
}

/**
 * @this {import('barnard59-core').Context}
 * @param {import('stream').Stream | { shape: import('stream').Stream, maxErrors?: number }} arg
 * @return {Promise<Transform>}
 */
export async function shacl(arg) {
  let shape
  let options
  /** @type {number | undefined} */
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

  return new ValidateChunk(this, await this.env.dataset().import(shape), { ...options, maxErrors })
}
