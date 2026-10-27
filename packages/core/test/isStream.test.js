import { strictEqual } from 'node:assert'
import { EventEmitter } from 'node:events'
import { Duplex, Readable, Writable } from 'node:stream'
import {
  isStream,
  isReadable,
  isReadableObjectMode,
  isWritable,
  isWritableObjectMode,
  isDuplex,
} from '../lib/isStream.js'

describe('isStream', function () {
  describe('isStream', function () {
    it('should be a function', function () {
      strictEqual(typeof isStream, 'function')
    })

    it('should return true if the given object is a stream', function () {
      const obj = new Readable({ read: () => {} })

      strictEqual(isStream(obj), true)
    })

    it('should return false if the given object is not a stream', function () {
      const obj = new EventEmitter()

      strictEqual(isStream(obj), false)
    })
  })

  describe('isReadable', function () {
    it('should be a function', function () {
      strictEqual(typeof isReadable, 'function')
    })

    it('should return true if the given object is a Readable', function () {
      const obj = new Readable({ read: () => {} })

      strictEqual(isReadable(obj), true)
    })

    it('should return false if the given object is not a Readable', function () {
      const obj = new Writable({ write: () => {} })

      strictEqual(isReadable(obj), false)
    })
  })

  describe('isReadableObjectMode', function () {
    it('should be a function', function () {
      strictEqual(typeof isReadableObjectMode, 'function')
    })

    it('should return true if the given object is a Readable in object mode', function () {
      const obj = new Readable({ objectMode: true, read: () => {} })

      strictEqual(isReadableObjectMode(obj), true)
    })

    it('should return false if the given object is not a Readable in object mode', function () {
      const obj = new Readable({ read: () => {} })

      strictEqual(isReadableObjectMode(obj), false)
    })
  })

  describe('isWritable', function () {
    it('should be a function', function () {
      strictEqual(typeof isWritable, 'function')
    })

    it('should return true if the given object is a Writable', function () {
      const obj = new Writable({ write: () => {} })

      strictEqual(isWritable(obj), true)
    })

    it('should return false if the given object is not a Writable', function () {
      const obj = new Readable({ read: () => {} })

      strictEqual(isWritable(obj), false)
    })
  })

  describe('isWritableObjectMode', function () {
    it('should be a function', function () {
      strictEqual(typeof isWritableObjectMode, 'function')
    })

    it('should return true if the given object is a Writable in object mode', function () {
      const obj = new Writable({ objectMode: true, write: () => {} })

      strictEqual(isWritableObjectMode(obj), true)
    })

    it('should return false if the given object is not a Writable in object mode', function () {
      const obj = new Writable({ write: () => {} })

      strictEqual(isWritableObjectMode(obj), false)
    })
  })

  describe('isDuplex', function () {
    it('should be a function', function () {
      strictEqual(typeof isDuplex, 'function')
    })

    it('should return true if the given object is a Duplex', function () {
      const obj = new Duplex({ read: () => {}, write: () => {} })

      strictEqual(isDuplex(obj), true)
    })

    it('should return false if the given object is not a Duplex', function () {
      const obj = new Readable({ read: () => {} })

      strictEqual(isDuplex(obj), false)
    })
  })
})
