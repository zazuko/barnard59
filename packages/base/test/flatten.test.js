import { deepStrictEqual, strictEqual } from 'assert'
import { array } from 'get-stream'
import { isReadable, isWritable } from 'isstream'
import { describe, it } from 'mocha'
import { Readable } from 'readable-stream'
import flatten from '../flatten.js'

describe('flatten', () => {
  it('should be a function', () => {
    strictEqual(typeof flatten, 'function')
  })

  it('should return a duplex stream', async () => {
    const result = flatten()

    strictEqual(isWritable(result), true)
    strictEqual(isReadable(result), true)
  })

  it('should do nothing if there are no input chunks', async () => {
    const input = Readable({
      objectMode: true,
      read: () => {
        input.push(null)
      }
    })

    const result = await array(input.pipe(flatten()))

    deepStrictEqual(result, [])
  })

  it('should flatten object with a iterator interface', async () => {
    const toIterator = input => {
      return {
        [Symbol.iterator]: input[Symbol.iterator].bind(input)
      }
    }
    const expected = ['a', 'b', 'c', 'd']
    const input = Readable({
      objectMode: true,
      read: () => {
        input.push(toIterator(['a', 'b']))
        input.push(toIterator(['c', 'd']))
        input.push(null)
      }
    })

    const result = await array(input.pipe(flatten()))

    deepStrictEqual(result, expected)
  })

  it('should flatten object with a forEach method', async () => {
    const toForEach = input => {
      return {
        forEach: input.forEach.bind(input)
      }
    }
    const expected = ['a', 'b', 'c', 'd']
    const input = Readable({
      objectMode: true,
      read: () => {
        input.push(toForEach(['a', 'b']))
        input.push(toForEach(['c', 'd']))
        input.push(null)
      }
    })

    const result = await array(input.pipe(flatten()))

    deepStrictEqual(result, expected)
  })

  it('should emit an error if the chunks don\'t implement Symbol.iterator or .forEach', async () => {
    let error = null
    const input = Readable({
      objectMode: true,
      read: () => {
        input.push({})
        input.push(null)
      }
    })

    try {
      await array(input.pipe(flatten()))
    } catch (err) {
      error = err
    }

    strictEqual(error.message.includes('implement Symbol.iterator or .forEach'), true)
  })
})
