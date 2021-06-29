import { SpanStatusCode } from '@opentelemetry/api'
import once from 'lodash/once.js'
import streams from 'readable-stream'
import createStream from './factory/stream.js'
import { isReadable } from './isStream.js'
import nextLoop from './nextLoop.js'
import StreamObject from './StreamObject.js'
import tracer from './tracer.js'

const { finished } = streams

class Pipeline extends StreamObject {
  constructor ({
    basePath,
    children,
    context,
    loaderRegistry,
    logger,
    onInit,
    ptr,
    readable,
    readableObjectMode,
    variables,
    writable,
    writableObjectMode
  }) {
    super({ basePath, children, context, loaderRegistry, logger, ptr, variables })

    this.logger.debug({ iri: this.ptr.value, message: 'create new Pipeline' })

    this.readable = readable
    this.readableObjectMode = readableObjectMode
    this.writable = writable
    this.writableObjectMode = writableObjectMode

    this.read = this._read.bind(this)
    this.write = this._write.bind(this)
    this.final = this._final.bind(this)

    this.stream = createStream(this)
    this.stream.pipeline = this

    this.onInit = onInit || (() => {})
    this.init = once(this._init.bind(this))

    this.logger.info({ iri: this.ptr.value, message: 'created new Pipeline' })
  }

  get firstChild () {
    return this.children[0]
  }

  get lastChild () {
    return this.children[this.children.length - 1]
  }

  _init () {
    return tracer.startActiveSpan('Pipeline#init', { attributes: { iri: this.ptr.value } }, async span => {
      this.logger.debug({ iri: this.ptr.value, message: 'initialize Pipeline' })

      try {
        await this.onInit(this)

        if (this.children.length === 0) {
          throw new Error(`pipeline ${this.ptr.value} does not contain any steps`)
        }

        // connect all steps
        for (let index = 0; index < this.children.length - 1; index++) {
          this.children[index].stream.pipe(this.children[index + 1].stream)
        }

        // add error handler to all steps
        for (let index = 0; index < this.children.length; index++) {
          this.children[index].stream.on('error', err => this.destroy(err))
        }

        finished(this.lastChild.stream, err => {
          if (!err) {
            this.finish()
          } else {
            console.error(err)
          }
        })
      } catch (err) {
        span.recordException(err)
        span.setStatus({ code: SpanStatusCode.ERROR, message: err.message })
        this.destroy(err)

        this.logger.error(err, { iri: this.ptr.value })
      } finally {
        span.end()
      }

      this.logger.debug({ iri: this.ptr.value, message: 'initialized Pipeline' })
    })
  }

  destroy (err) {
    this.stream.destroy(err)
  }

  finish () {
    if (isReadable(this.stream)) {
      return this.stream.push(null)
    }
  }

  // stream interface

  async _read (size) {
    await this.init()

    // if it's just a fake readable interface for events,
    // there is no data to forward from the last child
    if (!this.readable) {
      return
    }

    for (;;) {
      if (this.lastChild.stream._readableState.destroyed || this.lastChild.stream._readableState.endEmitted) {
        return
      }

      try {
        const chunk = this.lastChild.stream.read(size)

        if (!chunk) {
          await nextLoop()
        } else if (!this.stream.push(chunk)) {
          return
        }
      } catch (err) {
        this.lastChild.stream.destroy(err)
      }
    }
  }

  async _write (chunk, encoding, callback) {
    await this.init()

    return this.firstChild.stream.write(chunk, encoding, callback)
  }

  async _final (callback) {
    await this.init()

    finished(this.lastChild.stream, callback)

    this.firstChild.stream.end()
  }
}

export default Pipeline
