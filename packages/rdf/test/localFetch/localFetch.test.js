import { equal, strictEqual } from 'node:assert'
import fs from 'node:fs'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { expect } from 'chai'
import assertThrows from 'assert-throws-async'
import nock from 'nock'
import rdf from 'barnard59-env'
import { localFetch as unbound } from '../../lib/localFetch/localFetch.js'

const __dirname = fileURLToPath(new URL('.', import.meta.url))
const datasetPath = '../support/dataset.ttl'
const datasetAbsolutePath = resolve(__dirname, datasetPath)

async function getRDFDataset(filePath) {
  return rdf.dataset().import(rdf.fromFile(filePath))
}

const localFetch = unbound.bind({ env: rdf })

describe('metadata.lfetch', () => {
  beforeEach(() => {
    nock.cleanAll()
  })

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
    const { quadStream } = await localFetch(rdf.fromFile(datasetPath))
    const actual = await rdf.dataset().import(quadStream)
    equal(expected.equals(actual), true)
  })

  it('with filename and base, should get the same dataset', async () => {
    const expected = await getRDFDataset(datasetPath)
    const { quadStream } = await localFetch(datasetPath, __dirname)
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

  it.skip('fails at file not found', async () => {
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

    expect(actual.toCanonical()).to.eq(expected.toCanonical())
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
