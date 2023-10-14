import { deepStrictEqual, strictEqual } from 'assert'
import { array } from 'get-stream'
import { isReadable, isWritable } from 'isstream'
import { defaultLogger } from 'barnard59-core'
import glob from '../glob.js'

describe('glob', () => {
  let logger

  beforeEach(() => {
    logger = defaultLogger()
  })

  it('should be a function', () => {
    strictEqual(typeof glob, 'function')
  })

  it('should return a Readable stream', () => {
    const s = glob.call({ logger }, { pattern: 'test/support/*' })

    strictEqual(isReadable(s), true)
    strictEqual(isWritable(s), false)
  })

  it('should emit each file name as a chunk', async () => {
    const s = glob.call({ logger }, { pattern: '../../test/e2e/definitions/foreach/*' })

    const filenames = await array(s)

    deepStrictEqual(filenames, [
      '../../test/e2e/definitions/foreach/csv-duplicate.ttl',
      '../../test/e2e/definitions/foreach/with-handler.ttl',
      '../../test/e2e/definitions/foreach/with-variable.ttl',
    ])
  })

  it('should forward additional options', async () => {
    const s = glob.call({ logger }, {
      cwd: '../../test/e2e/definitions/foreach',
      pattern: '*',
    })

    const filenames = await array(s)

    deepStrictEqual(filenames, [
      'csv-duplicate.ttl',
      'with-handler.ttl',
      'with-variable.ttl',
    ])
  })
})
