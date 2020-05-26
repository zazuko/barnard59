const { deepStrictEqual, strictEqual } = require('assert')
const getStream = require('get-stream')
const intoStream = require('into-stream')
const { isReadable, isWritable } = require('isstream')
const { describe, it } = require('mocha')
const { finished, PassThrough, Readable } = require('readable-stream')
const forEach = require('../lib/forEach')

function passThroughPipeline () {
  const pipeline = new PassThrough({ objectMode: true })

  pipeline.data = []
  pipeline.vars = []

  pipeline.clone = ({ variables }) => {
    const sub = new PassThrough({ objectMode: true })

    sub.variables = variables
    sub.on('data', chunk => pipeline.data.push(chunk))

    finished(sub, () => {
      pipeline.vars.push(new Map(sub.variables))
    })

    return sub
  }

  return pipeline
}

describe('forEach', () => {
  it('should be a factory', () => {
    strictEqual(typeof forEach, 'function')
  })

  it('should create a duplex stream', () => {
    const pipeline = new Readable({ read: () => {} })
    const sub = passThroughPipeline()

    const stream = forEach.call(sub, pipeline)

    strictEqual(isReadable(stream), true)
    strictEqual(isWritable(stream), true)
  })

  it('should create a sup pipeline for each chunk', async () => {
    const chunks = ['a', 'b']
    const sub = passThroughPipeline()
    const output = forEach.call({
      pipeline: {},
      log: {}
    }, sub)

    intoStream.object(chunks).pipe(output)

    await getStream.array(output)

    deepStrictEqual(sub.data, chunks)
  })

  it('should call the callback for each chunk', async () => {
    const data = []
    const chunks = ['a', 'b']
    const sub = passThroughPipeline()
    const output = forEach.call({
      pipeline: {},
      log: {}
    }, sub, (...options) => data.push(options))

    intoStream.object(chunks).pipe(output)

    await getStream.array(output)

    deepStrictEqual(data.length, 2)
  })

  it('should call the callback with pipeline and chunk as argument', async () => {
    const data = []
    const chunks = ['a', 'b']
    const sub = passThroughPipeline()
    const output = forEach.call({
      pipeline: {},
      log: {}
    }, sub, (...options) => data.push(options))

    intoStream.object(chunks).pipe(output)

    await getStream.array(output)

    strictEqual(data[0][0] instanceof PassThrough, true)
    strictEqual(data[0][1], chunks[0])
    strictEqual(data[1][0] instanceof PassThrough, true)
    strictEqual(data[1][1], chunks[1])
  })

  it('should assign each chunk to the given variable', async () => {
    const chunks = ['a', 'b']
    const sub = passThroughPipeline()
    const output = forEach.call({
      pipeline: {
        variables: new Map()
      },
      log: {}
    }, sub, 'loop')

    intoStream.object(chunks).pipe(output)

    await getStream.array(output)

    deepStrictEqual(sub.vars[0], new Map([['loop', 'a']]))
    deepStrictEqual(sub.vars[1], new Map([['loop', 'b']]))
  })
})
