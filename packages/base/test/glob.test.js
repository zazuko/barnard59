import { deepStrictEqual, strictEqual } from 'assert'
import { array } from 'get-stream'
import { isReadable, isWritable } from 'isstream'
import { describe, it } from 'mocha'
import glob from '../glob.js'

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
    const s = glob({ pattern: 'test/support/definitions/e2e/*' })

    const filenames = await array(s)

    deepStrictEqual(filenames, [
      'test/support/definitions/e2e/foreach-csv-duplicate.ttl',
      'test/support/definitions/e2e/foreach-with-handler.ttl',
      'test/support/definitions/e2e/foreach-with-variable.ttl'
    ])
  })

  it('should forward additional options', async () => {
    const s = glob({
      cwd: 'test/support/definitions/e2e',
      pattern: '*'
    })

    const filenames = await array(s)

    deepStrictEqual(filenames, [
      'foreach-csv-duplicate.ttl',
      'foreach-with-handler.ttl',
      'foreach-with-variable.ttl'
    ])
  })
})
