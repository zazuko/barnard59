/* global describe, test */
const expect = require('expect')
const createBaseStream = require('../lib/createBaseStream')
const { isReadable, isWritable, isDuplex } = require('isstream')
const sleep = require('./support/sleep')

describe('createBaseStream', () => {
  describe('Readable wrapper', () => {
    test('creates a Readable stream', async () => {
      // given
      const pipeline = {}
      const init = () => {}

      // when
      const stream = createBaseStream(pipeline, { init })

      // then
      expect(isReadable(stream)).toBe(true)
    })

    test('calls the init function on read', async () => {
      // given
      let touched = false
      const pipeline = {}
      const init = () => {
        touched = true
      }
      const stream = createBaseStream(pipeline, { init })

      // when
      stream.read()
      await sleep(10)

      // then
      expect(touched).toBe(true)
    })
  })

  describe('Duplex', () => {
    test('creates a Duplex stream', async () => {
      // given
      const pipeline = { readable: true, writable: true }
      const init = () => {}
      const read = () => {}
      const write = () => {}

      // when
      const stream = createBaseStream(pipeline, { init, read, write })

      // then
      expect(isDuplex(stream)).toBe(true)
    })

    test('calls the init function when read is called first', async () => {
      // given
      let touched = false
      const pipeline = { readable: true, writable: true }
      const init = () => {
        touched = true
      }
      const read = () => {}
      const write = () => {}
      const stream = createBaseStream(pipeline, { init, read, write })

      // when
      stream.read()
      await sleep(10)

      // then
      expect(touched).toBe(true)
    })

    test('calls the init function when write is called first', async () => {
      // given
      let touched = false
      const pipeline = { readable: true, writable: true }
      const init = () => {
        touched = true
      }
      const read = () => {}
      const write = () => {}
      const stream = createBaseStream(pipeline, { init, read, write })

      // when
      stream.write('')
      await sleep(10)

      // then
      expect(touched).toBe(true)
    })

    test('calls the read function on read', async () => {
      // given
      let touched = false
      const pipeline = { readable: true, writable: true }
      const init = () => {}
      const read = () => {
        touched = true
      }
      const write = () => {}
      const stream = createBaseStream(pipeline, { init, read, write })

      // when
      stream.read()
      await sleep(10)

      // then
      expect(touched).toBe(true)
    })

    test('calls the write function on write', async () => {
      // given
      let touched = false
      const pipeline = { readable: true, writable: true }
      const init = () => {}
      const read = () => {}
      const write = () => {
        touched = true
      }
      const stream = createBaseStream(pipeline, { init, read, write })

      // when
      stream.write('')
      await sleep(10)

      // then
      expect(touched).toBe(true)
    })
  })

  describe('Readable', () => {
    test('creates a Readable stream', async () => {
      // given
      const pipeline = { readable: true }
      const init = () => {}
      const read = () => {}

      // when
      const stream = createBaseStream(pipeline, { init, read })

      // then
      expect(isReadable(stream)).toBe(true)
    })

    test('calls the init function when read is called', async () => {
      // given
      let touched = false
      const pipeline = { readable: true }
      const init = () => {
        touched = true
      }
      const read = () => {}
      const stream = createBaseStream(pipeline, { init, read })

      // when
      stream.read()
      await sleep(10)

      // then
      expect(touched).toBe(true)
    })

    test('calls the read function on read', async () => {
      // given
      let touched = false
      const pipeline = { readable: true }
      const init = () => {}
      const read = () => {
        touched = true
      }
      const stream = createBaseStream(pipeline, { init, read })

      // when
      stream.read()
      await sleep(10)

      // then
      expect(touched).toBe(true)
    })
  })

  describe('Writable', () => {
    test('creates a Writable stream', async () => {
      // given
      const pipeline = { writable: true }
      const init = () => {}
      const write = () => {}

      // when
      const stream = createBaseStream(pipeline, { init, write })

      // then
      expect(isWritable(stream)).toBe(true)
    })

    test('calls the init function when write is called', async () => {
      // given
      let touched = false
      const pipeline = { writable: true }
      const init = () => {
        touched = true
      }
      const write = () => {}
      const stream = createBaseStream(pipeline, { init, write })

      // when
      stream.write('')
      await sleep(10)

      // then
      expect(touched).toBe(true)
    })

    test('calls the write function on write', async () => {
      // given
      let touched = false
      const pipeline = { writable: true }
      const init = () => {}
      const write = () => {
        touched = true
      }
      const stream = createBaseStream(pipeline, { init, write })

      // when
      stream.write('')
      await sleep(10)

      // then
      expect(touched).toBe(true)
    })
  })
})
