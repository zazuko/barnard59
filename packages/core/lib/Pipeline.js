import * as otel from '@opentelemetry/api'
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

    // Create a span for the whole pipeline
    this._span = tracer.startSpan(`Pipeline <${this.ptr.value}>`, { attributes: { iri: this.ptr.value } })
    // Then create a OTEL context with this span bound
    this.ctx = otel.trace.setSpan(otel.context.active(), this._span)

    // And bind it to all methods. This helps attaching the child span
    // correctly and have the right context when logging
    this.read = otel.context.bind(this.ctx, this._read.bind(this))
    this.write = otel.context.bind(this.ctx, this._write.bind(this))
    this.final = otel.context.bind(this.ctx, this._final.bind(this))

    this.stream = createStream(this)
    this.stream.pipeline = this

    this.onInit = onInit || (() => { })
    this.init = once(otel.context.bind(this.ctx, this._init.bind(this)))

    this._chunks = 0

    this.logger.info({ iri: this.ptr.value, message: 'created new Pipeline' })
  }

  get firstChild () {
    return this.children[0]
  }

  get lastChild () {
    return this.children[this.children.length - 1]
  }

  async _init () {
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
      this.destroy(err)

      this.logger.error(err, { iri: this.ptr.value })
    }

    this.logger.debug({ iri: this.ptr.value, message: 'initialized Pipeline' })
  }

  destroy (err) {
    this._span.setStatus({ code: otel.SpanStatusCode.ERROR })
    this._span.end()
    this.stream.destroy(err)
  }

  finish () {
    this._span.setStatus({ code: otel.SpanStatusCode.OK })
    this._span.end()
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

    for (; ;) {
      if (this.lastChild.stream._readableState.destroyed || this.lastChild.stream._readableState.endEmitted) {
        return
      }

      try {
        const chunk = this.lastChild.stream.read(size)

        if (!chunk) {
          await nextLoop()
        } else if (!this.stream.push(chunk)) {
          return
        } else {
          if (this._chunks === 0) {
            this._span.addEvent('first chunk')
          }
          this._chunks++
          this._span.setAttribute('stream.chunks', this._chunks)
        }
      } catch (err) {
        this._span.recordException(err)
        this.lastChild.stream.destroy(err)
      }
    }
  }

  async _write (chunk, encoding, callback) {
    await this.init()

    this._span.addEvent('write')
    return this.firstChild.stream.write(chunk, encoding, callback)
  }

  async _final (callback) {
    await this.init()

    finished(this.lastChild.stream, callback)

    this.firstChild.stream.end()
  }
}

export default Pipeline
