import { equal, strictEqual } from 'assert'
import fs from 'fs'
import { resolve } from 'path'
import defaultFormats from '@rdfjs/formats-common'
import assertThrows from 'assert-throws-async'
import { describe, it } from 'mocha'
import nock from 'nock'
import rdf from 'rdf-ext'
import { localFetch } from '../../lib/localFetch/localFetch.js'

const datasetPath = '../support/dataset.ttl'
const datasetAbsolutePath = new URL(datasetPath, import.meta.url).toString()

async function getRDFDataset (filePath) {
  return rdf.dataset().import(getRDFStream(filePath))
}

function getRDFStream (filePath) {
  const stream = fs.createReadStream(new URL(filePath, import.meta.url))
  const parser = defaultFormats.parsers.get('text/turtle')
  return parser.import(stream)
}

describe('metadata.lfetch', () => {
  it('should be a function', () => {
    strictEqual(typeof localFetch, 'function')
  })

  it('should throw an error if no input is given', async () => {
    await assertThrows(async () => {
      await localFetch()
    }, Error, /needs input filename or URL/)
  })

  it('should throw an error if no valid input is given', async () => {
    await assertThrows(async () => {
      await localFetch({ not: 'this' })
    }, Error, /needs input filename or URL, got /)
  })

  it('with defaults, should get the same dataset', async () => {
    const expected = await getRDFDataset(datasetPath)
    const { quadStream } = await localFetch(getRDFStream(datasetPath))
    const actual = await rdf.dataset().import(quadStream)
    equal(expected.equals(actual), true)
  })

  it('with filename and base, should get the same dataset', async () => {
    const expected = await getRDFDataset(datasetPath)
    const { quadStream } = await localFetch(datasetPath, resolve('./test/ldfetch'))
    const actual = await rdf.dataset().import(quadStream)

    equal(expected.equals(actual), true)
  })

  it('with absolute filename, should get the same dataset', async () => {
    const expected = await getRDFDataset(datasetPath)
    const { quadStream } = await localFetch(datasetAbsolutePath)
    const actual = await rdf.dataset().import(quadStream)

    equal(expected.equals(actual), true)
  })

  it('with absolute filename, should ignore basePath and get the same dataset', async () => {
    const expected = await getRDFDataset(datasetPath)
    const { quadStream } = await localFetch(datasetAbsolutePath, '/unknown/')
    const actual = await rdf.dataset().import(quadStream)

    equal(expected.equals(actual), true)
  })

  it('fails at file not found', async () => {
    await assertThrows(async () => {
      await localFetch('file:///not/found.ttl')
    }, Error, /ENOENT: no such file or directory/)
  })

  it('fails if not string', async () => {
    await assertThrows(async () => {
      await localFetch(['a', 'b'])
    }, Error, /needs input filename or URL, got \[object\]/)
  })

  it('should get a dataset from URL pointing to a public resource', async () => {
    // Mocking a remote file.
    const fileStr = fs.readFileSync(new URL(datasetPath, import.meta.url), 'utf8')
    nock('https://example.com')
      .get('/metadata.ttl')
      .reply(200, fileStr, { 'content-type': 'text/turtle' })

    const expected = await getRDFDataset(datasetPath)
    const { quadStream } = await localFetch('https://example.com/metadata.ttl')
    const actual = await rdf.dataset().import(quadStream)

    equal(expected.equals(actual), true)
  })

  it('fails at unknown file extension', async () => {
    await assertThrows(async () => {
      await localFetch(new URL('../support/file.unknown.extension', import.meta.url).toString())
    }, Error, /No parser could be guessed for/)
  })

  it('fails at unknown protocol', async () => {
    await assertThrows(async () => {
      await localFetch('unknown::protocol')
    }, Error, /unknown protocol/)
  })
})
