import { deepStrictEqual, strictEqual } from 'node:assert'
import { array } from 'get-stream'
import { isReadableStream as isReadable, isWritableStream as isWritable } from 'is-stream'
import { Readable } from 'readable-stream'
import batch from '../batch.js'

describe('batch', () => {
  it('should be a function', () => {
    strictEqual(typeof batch, 'function')
  })

  it('should return a duplex stream', async () => {
    const result = batch()

    strictEqual(isWritable(result), true)
    strictEqual(isReadable(result), true)
  })

  it('should do nothing if there are no input chunks', async () => {
    const input = Readable({
      objectMode: true,
      read: () => {
        input.push(null)
      },
    })

    const result = await array(input.pipe(batch()))

    deepStrictEqual(result, [])
  })

  it('should split input in batches', async () => {
    const expected = [['a', 'b'], ['c', 'd'], ['e']]
    const input = Readable({
      objectMode: true,
      read: () => {
        ['a', 'b', 'c', 'd', 'e', null].forEach(item => input.push(item))
      },
    })

    const result = await array(input.pipe(batch(2)))

    deepStrictEqual(result, expected)
  })

  it('should emit a single batch', async () => {
    const expected = [['a', 'b', 'c', 'd', 'e']]
    const input = Readable({
      objectMode: true,
      read: () => {
        ['a', 'b', 'c', 'd', 'e', null].forEach(item => input.push(item))
      },
    })

    const result = await array(input.pipe(batch(0)))

    deepStrictEqual(result, expected)
  })
})
