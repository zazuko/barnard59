import { Duplex } from 'stream'
import { isStream, isReadableStream } from 'is-stream'
import SHACLValidator from 'rdf-validate-shacl'

async function * validate(iterable, validator, maxViolations) {
  let violations = 0
  for await (const chunk of iterable) {
    if (maxViolations && violations >= maxViolations) {
      continue // skip validation but continue to avoid finalization issues
    }
    const report = validator.validate(chunk)
    if (!report.conforms) {
      violations = violations + report.results.filter(r => r.severity.value === 'http://www.w3.org/ns/shacl#Violation').length
      yield report.dataset
    }
  }
  if (violations && maxViolations) {
    throw new Error(`At least ${violations} violations found`)
  }
  if (violations) {
    throw new Error(`${violations} violations found`)
  }
}

export async function shacl(arg) {
  let shape
  let options
  let maxErrors
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

  const ds = await this.env.dataset().import(shape)
  const validator = new SHACLValidator(ds, { maxErrors: 0, factory: this.env })
  return Duplex.from(iterable => validate(iterable, validator, maxErrors))
}
