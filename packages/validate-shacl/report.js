import { isStream, isReadableStream } from 'is-stream'
import SHACLValidator from 'rdf-validate-shacl'
import { Transform } from 'readable-stream'

class ValidateChunk extends Transform {
  constructor(context, shape) {
    super({
      writableObjectMode: true,
      readableObjectMode: true,
    })
    this.context = context
    this.validator = new SHACLValidator(shape, { maxErrors: 0, factory: context.env })
  }

  _transform(data, encoding, callback) {
    const report = this.validator.validate(data)
    if (!report.conforms) {
      callback(null, report.dataset)
    }
  }
}

export async function shacl(arg) {
  let shape
  if (isStream(arg)) {
    shape = arg
  } else if (arg) {
    ({ shape } = arg)
  }

  if (!shape) {
    throw new Error('Needs a SHACL shape as parameter')
  }
  if (!isReadableStream(shape)) {
    throw new Error(`${shape} is not a readable stream`)
  }

  return new ValidateChunk(this, await this.env.dataset().import(shape))
}
