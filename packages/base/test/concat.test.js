import { deepStrictEqual, strictEqual, rejects } from 'assert'
import getStream, { array } from 'get-stream'
import { isReadable, isWritable } from 'isstream'
import { describe, it } from 'mocha'
import { Readable } from 'readable-stream'
import concat, { object } from '../concat.js'

describe('concat', () => {
  it('should be a function', () => {
    strictEqual(typeof concat, 'function')
  })

  it('should return a Readable', () => {
    const s = concat(new Readable({ read: () => {} }))

    strictEqual(isReadable(s), true)
    strictEqual(isWritable(s), false)
  })

  it('should process one stream after another', async () => {
    let end0 = null
    let start1 = null

    const stream0 = new Readable({
      read: () => {
        setTimeout(() => {
          end0 = Date.now()
          stream0.push(null)
        }, 50)
      }
    })

    const stream1 = new Readable({
      read: () => {
        start1 = Date.now()
        stream1.push(null)
      }
    })

    const s = concat(stream0, stream1)

    await getStream(s)

    strictEqual(end0 <= start1, true)
  })

  it('should emit chunks from all streams in order', async () => {
    const stream0 = new Readable({
      read: () => {
        stream0.push('a')
        stream0.push('b')
        stream0.push(null)
      }
    })

    const stream1 = new Readable({
      read: () => {
        stream1.push('c')
        stream1.push('d')
        stream1.push(null)
      }
    })

    const s = concat(stream0, stream1)

    const result = await getStream(s)

    strictEqual(result, 'abcd')
  })

  it('should forward error events', async () => {
    const stream0 = new Readable({
      read: () => {
        stream0.destroy(new Error('test'))
      }
    })

    const stream1 = new Readable({
      read: () => {
        stream1.push('c')
        stream1.push('d')
        stream1.push(null)
      }
    })

    const s = concat(stream0, stream1)

    await rejects(() => getStream(s))
  })

  describe('object', () => {
    it('should be a function', () => {
      strictEqual(typeof object, 'function')
    })

    it('should return a Readable', () => {
      const s = object(new Readable({ read: () => {} }))

      strictEqual(isReadable(s), true)
      strictEqual(isWritable(s), false)
    })

    it('should process one stream after another', async () => {
      let end0 = null
      let start1 = null

      const stream0 = new Readable({
        read: () => {
          setTimeout(() => {
            end0 = Date.now()
            stream0.push(null)
          }, 50)
        }
      })

      const stream1 = new Readable({
        read: () => {
          start1 = Date.now()
          stream1.push(null)
        }
      })

      const s = object(stream0, stream1)

      await getStream(s)

      strictEqual(end0 <= start1, true)
    })

    it('should emit chunks from all streams in order', async () => {
      const stream0 = new Readable({
        objectMode: true,
        read: () => {
          stream0.push('a')
          stream0.push('b')
          stream0.push(null)
        }
      })

      const stream1 = new Readable({
        objectMode: true,
        read: () => {
          stream1.push('c')
          stream1.push('d')
          stream1.push(null)
        }
      })

      const s = object(stream0, stream1)

      const result = await array(s)

      deepStrictEqual(result, ['a', 'b', 'c', 'd'])
    })

    it('should forward error events', async () => {
      const stream0 = new Readable({
        objectMode: true,
        read: () => {
          stream0.destroy(new Error('test'))
        }
      })

      const stream1 = new Readable({
        objectMode: true,
        read: () => {
          stream1.push('c')
          stream1.push('d')
          stream1.push(null)
        }
      })

      const s = object(stream0, stream1)

      await rejects(() => array(s))
    })
  })
})
