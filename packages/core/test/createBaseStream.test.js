const { strictEqual } = require('assert')
const { describe, it } = require('mocha')
const { isReadable, isWritable, isDuplex } = require('isstream')
const createBaseStream = require('../lib/createBaseStream')
const eventToPromise = require('../lib/eventToPromise')
const createDummyPipeline = require('./support/createDummyPipeline')

describe('createBaseStream', () => {
  describe('Plain', () => {
    it('should create a Readable stream', async () => {
      // given
      const pipeline = createDummyPipeline()
      const init = () => {}

      // when
      const stream = createBaseStream(pipeline, { init })

      // then
      strictEqual(isReadable(stream), true)
    })

    it('should call the init function on read', async () => {
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
      strictEqual(touched, true)
    })

    it('should not call the pipeline read function', async () => {
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
      strictEqual(touched, false)
    })
  })

  describe('Duplex', () => {
    it('should create a Duplex stream', async () => {
      // given
      const pipeline = createDummyPipeline({ readable: true, writable: true })

      // when, { init }
      const stream = createBaseStream(pipeline)

      // then
      strictEqual(isDuplex(stream), true)
    })

    it('should call the init function when read is called first', async () => {
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
      strictEqual(touched, true)
    })

    it('should call the init function when write is called first', async () => {
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
      strictEqual(touched, true)
    })

    it('should call the read function on read', async () => {
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
      strictEqual(touched, true)
    })

    it('should call the write function on write', async () => {
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
      strictEqual(touched, true)
    })
  })

  describe('Readable', () => {
    it('should create a Readable stream', async () => {
      // given
      const pipeline = createDummyPipeline({ readable: true })

      // when
      const stream = createBaseStream(pipeline)

      // then
      strictEqual(isReadable(stream), true)
    })

    it('should call the init function when read is called', async () => {
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
      strictEqual(touched, true)
    })

    it('should call the read function on read', async () => {
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
      strictEqual(touched, true)
    })
  })

  describe('Writable', () => {
    it('should create a Writable stream', async () => {
      // given
      const pipeline = createDummyPipeline({ writable: true })

      // when
      const stream = createBaseStream(pipeline)

      // then
      strictEqual(isWritable(stream), true)
    })

    it('should call the init function when write is called', async () => {
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
      strictEqual(touched, true)
    })

    it('should call the write function on write', async () => {
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
      strictEqual(touched, true)
    })
  })
})
