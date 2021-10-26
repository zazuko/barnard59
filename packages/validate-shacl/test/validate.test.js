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
import validate from '../validate.js'

const { toStream } = pkg

const shapePath = 'support/simple.shape.ttl'
const simpleShapeFile = new URL(shapePath, import.meta.url).toString()

async function getRDFStream (filePath) {
  const stream = fs.createReadStream(new URL(filePath, import.meta.url))
  const parser = new ParserN3({ factory: rdf })
  return rdf.dataset().import(parser.import(stream))
}

function getShapeRDFStream () {
  return getRDFStream(shapePath)
}

describe('validate-shacl', () => {
  describe('validate', () => {
    it('should be a factory', () => {
      strictEqual(typeof validate, 'function')
    })

    it('should throw an error if no shacl is given', async () => {
      await assertThrows(async () => {
        await validate({})
      }, Error, /needs a shacl or shaclStream argument/)
    })

    it('should throw an error if shacl and shaclStream is given', async () => {
      await assertThrows(async () => {
        await validate({ shacl: simpleShapeFile, shaclStream: getShapeRDFStream() })
      }, Error, /shacl and shaclStream given, but only one argument allowed/)
    })

    it('should return a duplex stream with the shaclStream parameter', async () => {
      const stream = await validate({ shaclStream: getShapeRDFStream() })

      strictEqual(isReadable(stream), true)
      strictEqual(isWritable(stream), true)
      stream.end()

      try {
        await getStream(stream)
      } catch (err) {}
    })

    it('fails at unknown protocol', async () => {
      await assertThrows(async () => {
        await validate({ shacl: 'unknown::protocol' })
      }, Error, /unknown::protocol not supported/)
    })

    it('does not fail when validation ok', async () => {
      const data = await getRDFStream('support/data.ttl')
      const dataset = [data, data, data, data]

      // Assumes partitioned data is sent through
      const validator = await validate({ shaclStream: getShapeRDFStream() })
      const validatedInput = toStream(dataset).pipe(validator)

      const passedTrough = await getStream.array(validatedInput)
      strictEqual(passedTrough.length, dataset.length)
    })

    it('successfully fails when there are validation errors', async () => {
      const data = await getRDFStream('support/data.ttl')
      const wrongData = await getRDFStream('support/wrong-data.ttl')
      const dataset = [data, data, wrongData, data]

      // Assumes partitioned data is sent through
      const validator = await validate({ shaclStream: getShapeRDFStream() })
      const validatedInput = toStream(dataset).pipe(validator)

      await assertThrows(async () => {
        await getStream.array(validatedInput)
      }, Error, /More than 1 values/)
    })

    it('should return a duplex stream with an URL pointing to a public resource', async () => {
      // Mocking a remote file.
      const fileStr = await fs.readFileSync(new URL(shapePath, import.meta.url), 'utf8')
      nock('https://example.com')
        .get('/shape.ttl')
        .reply(200, fileStr, { 'content-type': 'text/turtle' })

      const stream = await validate({ shacl: 'https://example.com/shape.ttl' })

      strictEqual(isReadable(stream), true)
      strictEqual(isWritable(stream), true)
      stream.end()

      try {
        await getStream(stream)
      } catch (err) {}
    })

    it('should return a duplex stream with an URL pointing to a file', async () => {
      const stream = await validate({ shacl: simpleShapeFile })

      strictEqual(isReadable(stream), true)
      strictEqual(isWritable(stream), true)
      stream.end()

      try {
        await getStream(stream)
      } catch (err) {}
    })
  })
})
