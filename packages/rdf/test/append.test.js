import { equal, strictEqual } from 'assert'
import fs from 'fs'
import fsp from 'fs/promises'
import { fileURLToPath } from 'url'
import defaultFormats from '@rdfjs/formats-common'
import assertThrows from 'assert-throws-async'
import getStream from 'get-stream'
import { isDuplexStream as isDuplex } from 'is-stream'
import { describe, it } from 'mocha'
import nock from 'nock'
import rdf from 'rdf-ext'
import { Readable } from 'readable-stream'
import append from '../lib/append.js'
import { schema, xsd, dcterms } from '../lib/namespaces.js'

const dataPath = './support/dataset.ttl'
new URL(dataPath, import.meta.url).toString()

const metadataPath = './support/dataset_description.ttl'
new URL(metadataPath, import.meta.url).toString()

const __dirname = fileURLToPath(new URL('.', import.meta.url))

const ex = rdf.namespace('http://example.org/')

async function getRDFDataset (filePath) {
  return rdf.dataset().import(getRDFStream(filePath))
}

function getRDFStream (filePath) {
  const stream = fs.createReadStream(new URL(filePath, import.meta.url))
  const parser = defaultFormats.parsers.get('text/turtle')
  return parser.import(stream)
}

async function applyStep (transform) {
  const initial = await getRDFDataset(dataPath)
  const stream = getRDFStream(dataPath).pipe(transform)
  const final = rdf.dataset(await getStream.array(stream))
  return { initial, final }
}

describe('metadata.append', () => {
  it('should be a factory', () => {
    strictEqual(typeof append, 'function')
  })

  it('should throw an error if no argument is given', async () => {
    await assertThrows(async () => {
      await append()
    }, Error, /Needs input as parameter/)
  })

  it('should return a duplex stream with a stream metadata parameter', async () => {
    const step = await append({
      input: getRDFStream(metadataPath)
    })
    strictEqual(isDuplex(step), true)
  })

  it('should return a duplex stream with a path (string) metadata parameter', async () => {
    const step = await append({
      input: metadataPath
    })
    strictEqual(isDuplex(step), true)
  })

  it('should return a duplex stream with an URL pointing to a public resource', async () => {
    // Mocking a remote file.
    const fileStr = fs.readFileSync(new URL(metadataPath, import.meta.url), 'utf8')
    nock('https://example.com')
      .get('/metadata.ttl')
      .reply(200, fileStr, { 'content-type': 'text/turtle' })

    const stream = await append({
      input: 'https://example.com/metadata.ttl'
    })
    strictEqual(isDuplex(stream), true)
  })

  it('should append data and metadata with default values', async () => {
    const all = rdf.dataset()
    all.addAll(await getRDFDataset(dataPath))
    all.addAll(await getRDFDataset(metadataPath))

    const step = await append({
      input: getRDFStream(metadataPath)
    })
    const { final } = await applyStep(step)

    equal(
      final.toCanonical(),
      all.toCanonical(), 'appended quads not as expected'
    )
  })

  it('should append data and metadata with default values, and path as string', async () => {
    const all = rdf.dataset()
    all.addAll(await getRDFDataset(dataPath))
    all.addAll(await getRDFDataset(metadataPath))

    const step = await append({
      input: metadataPath,
      basepath: __dirname
    })
    const { final } = await applyStep(step)

    equal(
      final.toCanonical(),
      all.toCanonical(), 'appended quads not as expected'
    )
  })

  it('should append data with the specified graph', async () => {
    const data = [
      rdf.quad(ex.subject0, ex.predicate0, ex.object0, ex.graph0)
    ]

    const metadata = [
      rdf.quad(ex.subject1, ex.predicate1, ex.object1, ex.graph1),
      rdf.quad(ex.subject2, ex.predicate2, ex.object2, ex.graph2)
    ]

    const graphString = 'http://example.org/metadata'
    const graph = rdf.namedNode(graphString)

    const step = await append({
      input: Readable.from(metadata),
      graph: graphString
    })

    const result = await getStream.array(Readable.from(data).pipe(step))

    strictEqual(result.length, 3)
    strictEqual(result[0].equals(data[0]), true)
    strictEqual(result[1].equals(metadata[0]), false)
    strictEqual(result[2].equals(metadata[1]), false)

    strictEqual(result[1].graph.value, graph.value)
    strictEqual(result[2].graph.value, graph.value)
  })

  it('fails at unknown protocol', async () => {
    await assertThrows(async () => {
      const step = await append({
        input: 'unknown::protocol'
      })
      await applyStep(step)
    }, Error, /unknown protocol/)
  })

  it('fails at file not found', async () => {
    await assertThrows(async () => {
      const step = await append({
        input: 'file:///not/found.ttl'
      })
      await applyStep(step)
    }, Error, /ENOENT: no such file or directory/)
  })
})

describe('File System: metadata.append', () => {
  it('should use resolved literal TIME_FILE_CREATION with dateCreated', async () => {
    const data = [
      rdf.quad(ex.subject0, ex.predicate0, ex.object0, ex.graph0)
    ]

    const step = await append({
      input: metadataPath,
      basepath: __dirname,
      dateCreated: 'TIME_FILE_CREATION'
    })

    const stats = await fsp.lstat(new URL(metadataPath, import.meta.url))
    const result = await getStream.array(Readable.from(data).pipe(step))
    strictEqual(result.length, 7)

    strictEqual(result[4].predicate.value, schema.dateModified.value)
    strictEqual(result[4].object.value, rdf.literal('2020-05-30').value)

    strictEqual(result[5].predicate.value, dcterms.created.value)
    strictEqual(result[5].object.value, rdf.literal((new Date(stats.birthtimeMs)).toISOString(), xsd.dateTime).value)

    strictEqual(result[6].predicate.value, schema.dateCreated.value)
    strictEqual(result[6].object.value, rdf.literal((new Date(stats.birthtimeMs)).toISOString(), xsd.dateTime).value)
  })

  it('should use resolved literal TIME_FILE_CREATION with dateModified', async () => {
    const data = [
      rdf.quad(ex.subject0, ex.predicate0, ex.object0, ex.graph0)
    ]

    const step = await append({
      input: metadataPath,
      basepath: __dirname,
      dateModified: 'TIME_FILE_CREATION'
    })

    const stats = await fsp.lstat(new URL(metadataPath, import.meta.url))
    const result = await getStream.array(Readable.from(data).pipe(step))

    strictEqual(result.length, 7)

    strictEqual(result[4].predicate.value, schema.dateCreated.value)
    strictEqual(result[4].object.value, rdf.literal('2020-05-30').value)

    strictEqual(result[5].predicate.value, dcterms.modified.value)
    strictEqual(result[5].object.value, rdf.literal((new Date(stats.birthtimeMs)).toISOString(), xsd.dateTime).value)

    strictEqual(result[6].predicate.value, schema.dateModified.value)
    strictEqual(result[6].object.value, rdf.literal((new Date(stats.birthtimeMs)).toISOString(), xsd.dateTime).value)
  })

  it('should use resolved literal TIME_FILE_MODIFICATION with dateCreated', async () => {
    const data = [
      rdf.quad(ex.subject0, ex.predicate0, ex.object0, ex.graph0)
    ]

    const step = await append({
      input: metadataPath,
      basepath: __dirname,
      dateCreated: 'TIME_FILE_MODIFICATION'
    })

    const stats = await fsp.lstat(new URL(metadataPath, import.meta.url))
    const result = await getStream.array(Readable.from(data).pipe(step))
    strictEqual(result.length, 7)

    strictEqual(result[4].predicate.value, schema.dateModified.value)
    strictEqual(result[4].object.value, rdf.literal('2020-05-30').value)

    strictEqual(result[5].predicate.value, dcterms.created.value)
    strictEqual(result[5].object.value, rdf.literal((new Date(stats.mtimeMs)).toISOString(), xsd.dateTime).value)

    strictEqual(result[6].predicate.value, schema.dateCreated.value)
    strictEqual(result[6].object.value, rdf.literal((new Date(stats.mtimeMs)).toISOString(), xsd.dateTime).value)
  })

  it('should use resolved literal TIME_FILE_MODIFICATION with dateModified', async () => {
    const data = [
      rdf.quad(ex.subject0, ex.predicate0, ex.object0, ex.graph0)
    ]

    const step = await append({
      input: metadataPath,
      basepath: __dirname,
      dateModified: 'TIME_FILE_MODIFICATION'
    })

    const stats = await fsp.lstat(new URL(metadataPath, import.meta.url))
    const result = await getStream.array(Readable.from(data).pipe(step))

    strictEqual(result.length, 7)

    strictEqual(result[4].predicate.value, schema.dateCreated.value)
    strictEqual(result[4].object.value, rdf.literal('2020-05-30').value)

    strictEqual(result[5].predicate.value, dcterms.modified.value)
    strictEqual(result[5].object.value, rdf.literal((new Date(stats.mtimeMs)).toISOString(), xsd.dateTime).value)

    strictEqual(result[6].predicate.value, schema.dateModified.value)
    strictEqual(result[6].object.value, rdf.literal((new Date(stats.mtimeMs)).toISOString(), xsd.dateTime).value)
  })

  it('should use resolved literal TIME_NOW with dateModified', async () => {
    const data = [
      rdf.quad(ex.subject0, ex.predicate0, ex.object0, ex.graph0)
    ]
    const metadata = [
      rdf.quad(ex.subject1, rdf.namedNode('http://www.w3.org/1999/02/22-rdf-syntax-ns#type'), schema.Dataset),
      rdf.quad(ex.subject1, schema.dateCreated, rdf.literal('2020-05-30')),
      rdf.quad(ex.subject1, schema.dateModified, rdf.literal('2020-05-30'))
    ]
    const step = await append({
      input: Readable.from(metadata),
      dateModified: 'TIME_NOW'
    })

    const result = await getStream.array(Readable.from(data).pipe(step))

    strictEqual(result.length, 4)

    strictEqual(result[2].predicate.value, schema.dateCreated.value)
    strictEqual(result[2].object.value, rdf.literal('2020-05-30').value)

    strictEqual(result[3].predicate.value, schema.dateModified.value)
    strictEqual(result[3].object.value === rdf.literal('2020-05-30').value, false)
  })

  it('should use resolved literal TIME_NOW with dateCreated', async () => {
    const data = [
      rdf.quad(ex.subject0, ex.predicate0, ex.object0, ex.graph0)
    ]
    const metadata = [
      rdf.quad(ex.subject1, rdf.namedNode('http://www.w3.org/1999/02/22-rdf-syntax-ns#type'), schema.Dataset),
      rdf.quad(ex.subject1, schema.dateCreated, rdf.literal('2020-05-30')),
      rdf.quad(ex.subject1, schema.dateModified, rdf.literal('2020-05-30'))
    ]
    const step = await append({
      input: Readable.from(metadata),
      dateCreated: 'TIME_NOW'
    })

    const result = await getStream.array(Readable.from(data).pipe(step))

    strictEqual(result.length, 4)

    strictEqual(result[2].predicate.value, schema.dateModified.value)
    strictEqual(result[2].object.value, rdf.literal('2020-05-30').value)

    strictEqual(result[3].predicate.value, schema.dateCreated.value)
    strictEqual(result[3].object.value === rdf.literal('2020-05-30').value, false)
  })

  it('should use specified literal with dateModified (string)', async () => {
    const data = [
      rdf.quad(ex.subject0, ex.predicate0, ex.object0, ex.graph0)
    ]
    const metadata = [
      rdf.quad(ex.subject1, rdf.namedNode('http://www.w3.org/1999/02/22-rdf-syntax-ns#type'), schema.Dataset),
      rdf.quad(ex.subject1, schema.dateModified, rdf.literal('2020-05-30'))
    ]
    const step = await append({
      input: Readable.from(metadata),
      dateModified: '1999-12-31'
    })

    const result = await getStream.array(Readable.from(data).pipe(step))

    strictEqual(result.length, 3)

    strictEqual(result[2].predicate.value, schema.dateModified.value)
    strictEqual(result[2].object.value, rdf.literal('1999-12-31').value)
  })

  it('should use specified literal with dateCreated (string)', async () => {
    const data = [
      rdf.quad(ex.subject0, ex.predicate0, ex.object0, ex.graph0)
    ]
    const metadata = [
      rdf.quad(ex.subject1, rdf.namedNode('http://www.w3.org/1999/02/22-rdf-syntax-ns#type'), schema.Dataset),
      rdf.quad(ex.subject1, schema.dateCreated, rdf.literal('2020-05-30'))
    ]
    const step = await append({
      input: Readable.from(metadata),
      dateCreated: '1999-12-31'
    })

    const result = await getStream.array(Readable.from(data).pipe(step))

    strictEqual(result.length, 3)

    strictEqual(result[2].predicate.value, schema.dateCreated.value)
    strictEqual(result[2].object.value, rdf.literal('1999-12-31').value)
  })

  it('should use specified literal with dateModified', async () => {
    const data = [
      rdf.quad(ex.subject0, ex.predicate0, ex.object0, ex.graph0)
    ]
    const metadata = [
      rdf.quad(ex.subject1, rdf.namedNode('http://www.w3.org/1999/02/22-rdf-syntax-ns#type'), schema.Dataset),
      rdf.quad(ex.subject1, schema.dateModified, rdf.literal('2020-05-30'))
    ]
    const step = await append({
      input: Readable.from(metadata),
      dateModified: rdf.literal('1999-12-31', xsd.dateTime)
    })

    const result = await getStream.array(Readable.from(data).pipe(step))

    strictEqual(result.length, 3)

    strictEqual(result[2].predicate.value, schema.dateModified.value)
    strictEqual(result[2].object.value, rdf.literal('1999-12-31').value)
  })

  it('should use specified literal with dateCreated', async () => {
    const data = [
      rdf.quad(ex.subject0, ex.predicate0, ex.object0, ex.graph0)
    ]
    const metadata = [
      rdf.quad(ex.subject1, rdf.namedNode('http://www.w3.org/1999/02/22-rdf-syntax-ns#type'), schema.Dataset),
      rdf.quad(ex.subject1, schema.dateCreated, rdf.literal('2020-05-30'))
    ]
    const step = await append({
      input: Readable.from(metadata),
      dateCreated: rdf.literal('1999-12-31', xsd.dateTime)
    })

    const result = await getStream.array(Readable.from(data).pipe(step))

    strictEqual(result.length, 3)

    strictEqual(result[2].predicate.value, schema.dateCreated.value)
    strictEqual(result[2].object.value, rdf.literal('1999-12-31').value)
  })
})
