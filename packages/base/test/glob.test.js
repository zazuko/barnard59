const { deepStrictEqual, strictEqual } = require('assert')
const getStream = require('get-stream')
const { isReadable, isWritable } = require('isstream')
const { describe, it } = require('mocha')
const glob = require('../lib/glob')

describe('glob', () => {
  it('should be a function', () => {
    strictEqual(typeof glob, 'function')
  })

  it('should return a Readable stream', () => {
    const s = glob({ pattern: 'test/support/*' })

    strictEqual(isReadable(s), true)
    strictEqual(isWritable(s), false)
  })

  it('should emit each file name as a chunk', async () => {
    const s = glob({ pattern: 'test/support/*' })

    const filenames = await getStream.array(s)

    deepStrictEqual(filenames, [
      'test/support/ExpressServer.js',
      'test/support/streamToString.js'
    ])
  })

  it('should forward additional options', async () => {
    const s = glob({
      cwd: 'test/support',
      pattern: '*'
    })

    const filenames = await getStream.array(s)

    deepStrictEqual(filenames, [
      'ExpressServer.js',
      'streamToString.js'
    ])
  })
})
