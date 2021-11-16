import { strictEqual } from 'assert'
import fs from 'fs'
import ParserN3 from '@rdfjs/parser-n3'
import assertThrows from 'assert-throws-async'
import getStream from 'get-stream'
import { isReadable, isWritable } from 'isstream'
import { describe, it } from 'mocha'
import nock from 'nock'
import pkg from 'rdf-dataset-ext'
import rdf from 'rdf-ext'
import { validate } from '../validate.js'

const { toStream } = pkg

const shapePath = 'support/simple.shape.ttl'
const simpleShapeFile = new URL(shapePath, import.meta.url).toString()

async function getRDFDataset (filePath) {
  return rdf.dataset().import(getRDFStream(filePath))
}

function getRDFStream (filePath) {
  const stream = fs.createReadStream(new URL(filePath, import.meta.url))
  const parser = new ParserN3({ factory: rdf })
  return parser.import(stream)
}

describe('validate-shacl', () => {
  describe('validate', () => {
    it('should be a factory', () => {
      strictEqual(typeof validate, 'function')
    })

    it('should throw an error if no argument is given', async () => {
      await assertThrows(async () => {
        await validate()
      }, Error, /Needs a SHACL shape as parameter/)
    })

    it('should return a duplex stream with a stream shape parameter', async () => {
      const stream = await validate(getRDFStream(shapePath))

      strictEqual(isReadable(stream), true)
      strictEqual(isWritable(stream), true)
      stream.end()

      const res = await getStream(stream)
    })

    it('should return a duplex stream with an URL pointing to a file', async () => {
      const stream = await validate(simpleShapeFile)

      strictEqual(isReadable(stream), true)
      strictEqual(isWritable(stream), true)
      stream.end()

      const res = await getStream(stream)
    })

    it('fails at file not found', async () => {
      await assertThrows(async () => {
        await validate('file:///not/found.ttl')
      }, Error, /ENOENT: no such file or directory/)
    })

    it('should return a duplex stream with an URL pointing to a public resource', async () => {
      // Mocking a remote file.
      const fileStr = await fs.readFileSync(new URL(shapePath, import.meta.url), 'utf8')
      nock('https://example.com')
        .get('/shape.ttl')
        .reply(200, fileStr, { 'content-type': 'text/turtle' })

      const stream = await validate('https://example.com/shape.ttl')
      strictEqual(isReadable(stream), true)
      strictEqual(isWritable(stream), true)
      stream.end()

      const res = await getStream(stream)
    })

    it('fails at unknown mediatype', async () => {
      await assertThrows(async () => {
        // Mocking a remote file.
        const fileStr = await fs.readFileSync(new URL(shapePath, import.meta.url), 'utf8')
        nock('https://example.com')
          .get('/shape.ttl')
          .reply(200, fileStr, { 'content-type': 'text/html' })
        const stream = await validate('https://example.com/shape.ttl')

      }, Error,/https:\/\/example.com\/shape.ttl: Error: unknown content type: text\/html/)
    })

    it('fails at unknown protocol', async () => {
      await assertThrows(async () => {
        await validate('unknown::protocol')
      }, Error, /unknown::protocol not supported/)
    })

    it('does not fail when validation ok', async () => {
      const data = await getRDFDataset('support/data.ttl')
      const dataset = [data, data, data, data]

      // Assumes partitioned data is sent through
      const validator = await validate(getRDFStream(shapePath))
      const validatedInput = toStream(dataset).pipe(validator)

      const passedTrough = await getStream.array(validatedInput)
      strictEqual(passedTrough.length, dataset.length)
    })

    it('successfully fails when there are validation errors', async () => {
      const data = await getRDFDataset('support/data.ttl')
      const wrongData = await getRDFDataset('support/wrong-data.ttl')
      const dataset = [data, data, wrongData, data]

      // Assumes partitioned data is sent through
      const validator = await validate(getRDFStream(shapePath))
      const validatedInput = toStream(dataset).pipe(validator)

      await assertThrows(async () => {
        await getStream.array(validatedInput)
      }, Error, /More than 1 values/)
    })

  })
})
