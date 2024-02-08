import { Duplex } from 'node:stream'
import { isReadableStream, isStream } from 'is-stream'
import SHACLValidator from 'rdf-validate-shacl'
import TermCounter from './lib/TermCounter.js'

/**
 * @this {import('barnard59-core').Context}
 * @param {import('@rdfjs/types').DatasetCore} ds
 * @param {number | undefined} maxViolations
 * @param {AsyncIterable<any>} iterable
 */
async function * validate(ds, maxViolations, iterable) {
  let totalViolations = 0
  const counter = new TermCounter(this.env)

  for await (const chunk of iterable) {
    if (maxViolations && totalViolations > maxViolations) {
      this.logger.warn('Exceeded max violations. Aborting')
      break
    }

    // create a new validator instance at each iteration to avoid memory leaks
    const validator = new SHACLValidator(ds, { maxErrors: 0, factory: this.env })
    const report = validator.validate(chunk)
    if (!report.conforms) {
      report.results.forEach(r => counter.add(r.severity))
      totalViolations = counter.termMap.get(this.env.ns.sh.Violation) ?? 0
      yield report.dataset
    }
  }

  counter.termMap.forEach((count, term) => this.logger.warn(`${count} results with severity ${term.value}`))

  if (totalViolations) {
    this.error(new Error(`${totalViolations} violations found`))
  } else {
    const report = this.env.dataset()
    const blankNode = this.env.blankNode('report')
    report.add(this.env.quad(blankNode, this.env.ns.rdf.type, this.env.ns.sh.ValidationReport))
    report.add(this.env.quad(blankNode, this.env.ns.sh.conforms, this.env.literal('true', this.env.ns.xsd.boolean)))
    yield report
  }
}

/**
 * @this {import('barnard59-core').Context}
 * @param {import('stream').Stream | { shape: import('stream').Stream, maxErrors?: number }} arg
 * @return {Promise<Duplex>}
 */
export async function shacl(arg) {
  let shape
  let options
  /** @type {number | undefined} */
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
