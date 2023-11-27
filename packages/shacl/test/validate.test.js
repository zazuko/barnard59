import assert, { strictEqual } from 'assert'
import * as url from 'url'
import assertThrows from 'assert-throws-async'
import { expect } from 'chai'
import getStream, { getStreamAsArray } from 'get-stream'
import { isReadableStream, isWritableStream } from 'is-stream'
import toStream from 'rdf-dataset-ext/toStream.js'
import sinon from 'sinon'
import env from 'barnard59-env'
import { shacl as unbound } from '../validate.js'

const shapePath = 'support/simple.shape.ttl'
new URL(shapePath, import.meta.url).toString()

const shacl = unbound.bind({ env })

async function getRDFDataset(filePath) {
  return env.dataset().import(getRDFStream(filePath))
}

function getRDFStream(filePath) {
  return env.fromFile(url.fileURLToPath(new URL(filePath, import.meta.url)))
}

describe('shacl', () => {
  describe('validate', () => {
    it('should be a factory', () => {
      strictEqual(typeof shacl, 'function')
    })

    it('should throw an error if no argument is given', async () => {
      await assertThrows(async () => {
        await shacl()
      }, Error, /Needs a SHACL shape as parameter/)
    })

    it('should return a duplex stream with a stream shape parameter', async () => {
      const stream = await shacl(getRDFStream(shapePath))

      strictEqual(isReadableStream(stream), true)
      strictEqual(isWritableStream(stream), true)
      stream.end()

      await getStream(stream)
    })

    it('sets maxErrors for validator', async () => {
      const stream = await shacl({
        shape: getRDFStream(shapePath),
        maxErrors: 200,
      })

      strictEqual(stream.validator.validationEngine.maxErrors, 200)
      stream.end()
    })

    it('unsets maxErrors when argument is zero', async () => {
      const stream = await shacl({
        shape: getRDFStream(shapePath),
        maxErrors: 0,
      })

      assert(typeof stream.validator.validationEngine.maxErrors === 'undefined')
      stream.end()
    })

    it('does not fail when validation ok', async () => {
      const data = await getRDFDataset('support/data.ttl')
      const dataset = [data, data, data, data]

      // Assumes partitioned data is sent through
      const validator = await shacl(getRDFStream(shapePath))
      const validatedInput = toStream(dataset).pipe(validator)

      const passedTrough = await getStreamAsArray(validatedInput)
      strictEqual(passedTrough.length, dataset.length)
    })

    it('successfully fails when there are validation errors', async () => {
      const data = await getRDFDataset('support/data.ttl')
      const wrongData = await getRDFDataset('support/wrong-data.ttl')
      const dataset = [data, data, wrongData, data]

      // Assumes partitioned data is sent through
      const validator = await shacl(getRDFStream(shapePath))
      const validatedInput = toStream(dataset).pipe(validator)

      await assertThrows(async () => {
        await getStreamAsArray(validatedInput)
      }, Error, error => {
        strictEqual(error.report.dataset.size > 0, true)
        strictEqual(error.shapesGraph.size > 0, true)
        strictEqual(error.dataGraph.size > 0, true)
        strictEqual(error.message.includes('More than 1 values'), true)
      })
    })

    it('does not fail when there are validation errors but callback returns true', async () => {
      const data = await getRDFDataset('support/data.ttl')
      const wrongData = await getRDFDataset('support/wrong-data.ttl')
      const dataset = [data, data, wrongData, data]
      const onViolation = sinon.stub().returns(true)
      const context = {}

      // Assumes partitioned data is sent through
      const validator = await shacl.call(context, {
        shape: getRDFStream(shapePath),
        onViolation,
      })
      const validatedInput = toStream(dataset).pipe(validator)

      const passedTrough = await getStreamAsArray(validatedInput)
      strictEqual(passedTrough.length, dataset.length)
      expect(onViolation).to.have.been.calledWithMatch({
        context,
        data: wrongData,
        report: sinon.match.object,
      })
    })
  })
})
