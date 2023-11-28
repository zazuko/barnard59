import { Duplex } from 'stream'
import { isReadableStream, isStream } from 'is-stream'
import SHACLValidator from 'rdf-validate-shacl'

async function * validate(ds, maxViolations, iterable) {
  let totalViolations = 0

  for await (const chunk of iterable) {
    if (maxViolations && totalViolations > maxViolations) {
      this.logger.warn('Exceeded max violations. Aborting')
      break
    }

    // create a new validator instance at each iteration to avoid memory leaks
    const validator = new SHACLValidator(ds, { maxErrors: 0, factory: this.env })
    const report = validator.validate(chunk)
    if (!report.conforms) {
      const violations = report.results.filter(r => this.env.ns.sh.Violation.equals(r.severity)).length
      totalViolations += violations
      yield report.dataset
    }
  }

  if (totalViolations) {
    this.error(new Error(`${totalViolations} violations found`))
  }
}

export async function shacl(arg) {
  let shape
  let options
  let maxViolations
  if (isStream(arg)) {
    shape = arg
  } else if (arg) {
    ({ shape, ...options } = arg)
    maxViolations = options.maxErrors < 1 ? 0 : Number(options.maxErrors)
  }

  if (!shape) {
    throw new Error('Needs a SHACL shape as parameter')
  }
  if (!isReadableStream(shape)) {
    throw new Error(`${shape} is not a readable stream`)
  }

  const ds = await this.env.dataset().import(shape)

  return Duplex.from(validate.bind(this, ds, maxViolations))
}
