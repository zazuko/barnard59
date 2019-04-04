const createBaseStream = require('../lib/createBaseStream')
const createDummyPipeline = require('./support/createDummyPipeline')
const eventToPromise = require('../lib/eventToPromise')
const expect = require('expect')
const { isReadable, isWritable, isDuplex } = require('isstream')

describe('createBaseStream', () => {
  describe('Plain', () => {
    test('creates a Readable stream', async () => {
      // given
      const pipeline = createDummyPipeline()
      const init = () => {}

      // when
      const stream = createBaseStream(pipeline, { init })

      // then
      expect(isReadable(stream)).toBe(true)
    })

    test('calls the init function on read', async () => {
      // given
      let touched = false
      const init = () => {
        touched = true
      }
      const pipeline = createDummyPipeline({ init })
      const stream = createBaseStream(pipeline)

      // when
      stream.resume()
      stream.destroy()
      await eventToPromise(stream, 'close')

      // then
      expect(touched).toBe(true)
    })

    test('doesn\'t call the pipeline read function', async () => {
      // given
      let touched = false
      const read = () => {
        touched = true
      }
      const pipeline = createDummyPipeline({ read })
      const stream = createBaseStream(pipeline)

      // when
      stream.resume()
      stream.destroy()
      await eventToPromise(stream, 'close')

      // then
      expect(touched).toBe(false)
    })
  })

  describe('Duplex', () => {
    test('creates a Duplex stream', async () => {
      // given
      const pipeline = createDummyPipeline({ readable: true, writable: true })

      // when, { init }
      const stream = createBaseStream(pipeline)

      // then
      expect(isDuplex(stream)).toBe(true)
    })

    test('calls the init function when read is called first', async () => {
      // given
      let touched = false
      const init = () => {
        touched = true
      }
      const pipeline = createDummyPipeline({ readable: true, writable: true, init })
      const stream = createBaseStream(pipeline)

      // when
      stream.resume()
      stream.destroy()
      await eventToPromise(stream, 'close')

      // then
      expect(touched).toBe(true)
    })

    test('calls the init function when write is called first', async () => {
      // given
      let touched = false
      const init = () => {
        touched = true
      }
      const pipeline = createDummyPipeline({ readable: true, writable: true, init })
      const stream = createBaseStream(pipeline)

      // when
      stream.write('')
      stream.destroy()
      await eventToPromise(stream, 'close')

      // then
      expect(touched).toBe(true)
    })

    test('calls the read function on read', async () => {
      // given
      let touched = false
      const read = () => {
        touched = true
      }
      const pipeline = createDummyPipeline({ readable: true, writable: true, read })
      const stream = createBaseStream(pipeline)

      // when
      stream.resume()
      stream.destroy()
      await eventToPromise(stream, 'close')

      // then
      expect(touched).toBe(true)
    })

    test('calls the write function on write', async () => {
      // given
      let touched = false
      const write = () => {
        touched = true
      }
      const pipeline = createDummyPipeline({ readable: true, writable: true, write })
      const stream = createBaseStream(pipeline)

      // when
      stream.write('')
      stream.destroy()
      await eventToPromise(stream, 'close')

      // then
      expect(touched).toBe(true)
    })
  })

  describe('Readable', () => {
    test('creates a Readable stream', async () => {
      // given
      const pipeline = createDummyPipeline({ readable: true })

      // when
      const stream = createBaseStream(pipeline)

      // then
      expect(isReadable(stream)).toBe(true)
    })

    test('calls the init function when read is called', async () => {
      // given
      let touched = false
      const init = () => {
        touched = true
      }
      const pipeline = createDummyPipeline({ readable: true, init })
      const stream = createBaseStream(pipeline)

      // when
      stream.resume()
      stream.destroy()
      await eventToPromise(stream, 'close')

      // then
      expect(touched).toBe(true)
    })

    test('calls the read function on read', async () => {
      // given
      let touched = false
      const read = () => {
        touched = true
      }
      const pipeline = createDummyPipeline({ readable: true, read })
      const stream = createBaseStream(pipeline)

      // when
      stream.resume()
      stream.destroy()
      await eventToPromise(stream, 'close')

      // then
      expect(touched).toBe(true)
    })
  })

  describe('Writable', () => {
    test('creates a Writable stream', async () => {
      // given
      const pipeline = createDummyPipeline({ writable: true })

      // when
      const stream = createBaseStream(pipeline)

      // then
      expect(isWritable(stream)).toBe(true)
    })

    test('calls the init function when write is called', async () => {
      // given
      let touched = false
      const init = () => {
        touched = true
      }
      const pipeline = createDummyPipeline({ writable: true, init })
      const stream = createBaseStream(pipeline)

      // when
      stream.write('')
      stream.destroy()
      await eventToPromise(stream, 'close')

      // then
      expect(touched).toBe(true)
    })

    test('calls the write function on write', async () => {
      // given
      let touched = false
      const write = () => {
        touched = true
      }
      const pipeline = createDummyPipeline({ writable: true, write })
      const stream = createBaseStream(pipeline)

      // when
      stream.write('')
      stream.destroy()
      await eventToPromise(stream, 'close')

      // then
      expect(touched).toBe(true)
    })
  })
})
