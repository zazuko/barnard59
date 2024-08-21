import { Duplex } from 'node:stream'
import { isReadableStream, isStream } from 'is-stream'
import SHACLValidator from 'rdf-validate-shacl'
import TermCounter from './lib/TermCounter.js'

/**
 * @this {import('barnard59-core').Context}
 * @param {object} options
 * @param {import('@rdfjs/types').DatasetCore | undefined} options.shapes
 * @param {number | undefined} options.maxViolations
 * @param {AsyncIterable<any>} iterable
 */
async function * validate({ shapes, maxViolations }, iterable) {
  let totalViolations = 0
  const counter = new TermCounter(this.env)

  for await (const chunk of iterable) {
    if (maxViolations && totalViolations > maxViolations) {
      this.logger.warn('Exceeded max violations. Aborting')
      break
    }

    const validator = new SHACLValidator(shapes || chunk, { maxErrors: 0, factory: this.env })
    const report = validator.validate(chunk)
    if (!report.conforms) {
      for (const result of report.results) {
        if (result.severity) counter.add(result.severity)
      }

      totalViolations = counter.termMap.get(this.env.ns.sh.Violation) ?? 0
      yield report.dataset
    }
  }

  counter.termMap.forEach((count, term) => this.logger.warn(`${count} results with severity ${term.value}`))

  if (totalViolations) {
    this.error(new Error(`${totalViolations} violations found`))
  }
  if (counter.termMap.size === 0) {
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

  let ds
  if (!shape) {
    this.logger.info('No shapes found. Will validate each chunk against shapes found in teh chunk itself')
  } else {
    if (!isReadableStream(shape)) {
      throw new Error(`${shape} is not a readable stream`)
    }
    ds = await this.env.dataset().import(shape)
  }

  return Duplex.from(validate.bind(this, {
    shapes: ds,
    maxViolations,
  }))
}
