import * as otel from '@opentelemetry/api'
import once from 'onetime'
import type { Stream } from 'readable-stream'
import streams from 'readable-stream'
import createStream, { assertWritable } from './factory/stream.js'
import { isReadable, isWritable } from './isStream.js'
import nextLoop from './nextLoop.js'
import type { Options as BaseOptions } from './StreamObject.js'
import StreamObject from './StreamObject.js'
import tracer from './tracer.js'

const { finished } = streams

export interface PipelineOptions extends BaseOptions {
  // eslint-disable-next-line no-use-before-define
  onInit?: (pipeline: Pipeline) => Promise<void>
  readable?: boolean
  readableObjectMode?: boolean
  writable?: boolean
  writableObjectMode?: boolean
}

// eslint-disable-next-line no-use-before-define
class Pipeline extends StreamObject<Stream & { pipeline?: Pipeline }> {
  public readonly readable: boolean | undefined
  public readonly readableObjectMode: boolean | undefined
  public readonly writable: boolean | undefined
  public readonly writableObjectMode: boolean | undefined
  private readonly onInit: ((pipeline: typeof this) => Promise<void>) | (() => void)
  private _chunks: number
  private readonly ctx: otel.Context
  public readonly init: () => Promise<void>
  public readonly read: (size: number) => Promise<void>
  public readonly write: (chunk: unknown, encoding: string, callback: (error?: (Error | null)) => void) => Promise<boolean>
  public readonly final: (callback: (error?: (Error | null)) => void) => Promise<void>
  public error: Error | undefined
  // eslint-disable-next-line no-use-before-define
  private readonly _stream: Stream & { pipeline: Pipeline }

  constructor({
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
    writableObjectMode,
  }: PipelineOptions) {
    super({ basePath, children, context, loaderRegistry, logger, ptr, variables })

    this.logger.trace({ iri: this.ptr.value, message: 'create new Pipeline' })

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

    this._stream = createStream(this) as unknown as Stream & { pipeline: Pipeline }
    this._stream.pipeline = this

    this.onInit = onInit || (() => { })
    this.init = once(otel.context.bind(this.ctx, this._init.bind(this)))

    this._chunks = 0

    this.logger.trace({ iri: this.ptr.value, message: 'created new Pipeline' })
  }

  get stream() {
    return this._stream
  }

  get firstChild() {
    return this.children[0]
  }

  get lastChild() {
    return this.children[this.children.length - 1]
  }

  addChild(step: StreamObject) {
    step.stream.on('error', err => this.destroy(err))
    this.children.push(step)
  }

  async _init() {
    this.logger.trace({ iri: this.ptr.value, message: 'initialize Pipeline' })

    try {
      await this.onInit(this)

      if (this.children.length === 0) {
        throw new Error(`pipeline ${this.ptr.value} does not contain any steps`)
      }

      // connect all steps
      for (let index = 0; index < this.children.length - 1; index++) {
        const child = this.children[index + 1]
        assertWritable(child)
        this.children[index].stream.pipe(child.stream)
      }

      this.lastChild.stream.on('end', () => {
        if (!isWritable(this.lastChild.stream) && !isReadable(this.lastChild.stream)) {
          this.lastChild.stream.emit('finish')
        }
      })

      finished(this.lastChild.stream, err => {
        if (!err) {
          this.finish()
        } else {
          this.logger.error(err)
        }
      })
    } catch (err: any) { // eslint-disable-line @typescript-eslint/no-explicit-any
      this.destroy(err)

      this.logger.error(err, { iri: this.ptr.value })
    }

    this.logger.trace({ iri: this.ptr.value, message: 'initialized Pipeline' })
  }

  destroy(err: Error) {
    this._span.setStatus({ code: otel.SpanStatusCode.ERROR })
    this._span.end()
    this.stream.destroy(err)
  }

  finish() {
    this._span.setStatus({ code: otel.SpanStatusCode.OK })
    this._span.end()
    if (isReadable(this.stream)) {
      return this.stream.push(null)
    }
  }

  // stream interface

  async _read(size: number) {
    try {
      await this.init()

      // if it's just a fake readable interface for events,
      // there is no data to forward from the last child
      if (!this.readable) {
        return
      }

      for (; ;) {
        if (this.stream._readableState.destroyed || this.lastChild.stream._readableState.destroyed || this.lastChild.stream._readableState.endEmitted) {
          return
        }

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
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      this._span.recordException(err)
      this.lastChild.stream.destroy(err)
    }
  }

  async _write(chunk: unknown, encoding: string, callback: (error?: Error | null) => void) {
    await this.init()

    assertWritable(this.firstChild)

    this._span.addEvent('write')
    return this.firstChild.stream.write(chunk, encoding, callback)
  }

  async _final(callback: (error?: Error | null) => void) {
    await this.init()

    assertWritable(this.firstChild)

    finished(this.lastChild.stream, callback)

    this.firstChild.stream.end()
  }
}

export default Pipeline
