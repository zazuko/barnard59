import { strictEqual } from 'assert'
import { EventEmitter } from 'events'
import { describe, it } from 'mocha'
import { Duplex, Readable, Writable } from 'readable-stream'
import {
  isStream,
  isReadable,
  isReadableObjectMode,
  isWritable,
  isWritableObjectMode,
  isDuplex,
} from '../lib/isStream.js'

describe('isStream', () => {
  describe('isStream', () => {
    it('should be a function', () => {
      strictEqual(typeof isStream, 'function')
    })

    it('should return true if the given object is a stream', () => {
      const obj = new Readable({ read: () => {} })

      strictEqual(isStream(obj), true)
    })

    it('should return false if the given object is not a stream', () => {
      const obj = new EventEmitter()

      strictEqual(isStream(obj), false)
    })
  })

  describe('isReadable', () => {
    it('should be a function', () => {
      strictEqual(typeof isReadable, 'function')
    })

    it('should return true if the given object is a Readable', () => {
      const obj = new Readable({ read: () => {} })

      strictEqual(isReadable(obj), true)
    })

    it('should return false if the given object is not a Readable', () => {
      const obj = new Writable({ write: () => {} })

      strictEqual(isReadable(obj), false)
    })
  })

  describe('isReadableObjectMode', () => {
    it('should be a function', () => {
      strictEqual(typeof isReadableObjectMode, 'function')
    })

    it('should return true if the given object is a Readable in object mode', () => {
      const obj = new Readable({ objectMode: true, read: () => {} })

      strictEqual(isReadableObjectMode(obj), true)
    })

    it('should return false if the given object is not a Readable in object mode', () => {
      const obj = new Readable({ read: () => {} })

      strictEqual(isReadableObjectMode(obj), false)
    })
  })

  describe('isWritable', () => {
    it('should be a function', () => {
      strictEqual(typeof isWritable, 'function')
    })

    it('should return true if the given object is a Writable', () => {
      const obj = new Writable({ write: () => {} })

      strictEqual(isWritable(obj), true)
    })

    it('should return false if the given object is not a Writable', () => {
      const obj = new Readable({ read: () => {} })

      strictEqual(isWritable(obj), false)
    })
  })

  describe('isWritableObjectMode', () => {
    it('should be a function', () => {
      strictEqual(typeof isWritableObjectMode, 'function')
    })

    it('should return true if the given object is a Writable in object mode', () => {
      const obj = new Writable({ objectMode: true, write: () => {} })

      strictEqual(isWritableObjectMode(obj), true)
    })

    it('should return false if the given object is not a Writable in object mode', () => {
      const obj = new Writable({ write: () => {} })

      strictEqual(isWritableObjectMode(obj), false)
    })
  })

  describe('isDuplex', () => {
    it('should be a function', () => {
      strictEqual(typeof isDuplex, 'function')
    })

    it('should return true if the given object is a Duplex', () => {
      const obj = new Duplex({ read: () => {}, write: () => {} })

      strictEqual(isDuplex(obj), true)
    })

    it('should return false if the given object is not a Duplex', () => {
      const obj = new Readable({ read: () => {} })

      strictEqual(isDuplex(obj), false)
    })
  })
})
