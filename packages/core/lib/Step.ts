import once from 'onetime'
import { Stream } from 'readable-stream'
import StreamObject, { Options as BaseOptions } from './StreamObject.js'
import tracer from './tracer.js'
import type { Operation } from './factory/operation.js'

export interface StepOptions extends BaseOptions {
  args: unknown[]
  operation: Operation
  stream: Stream
}

// eslint-disable-next-line no-use-before-define
class Step extends StreamObject<Stream & { step: Step }> {
  private args: unknown[]
  private operation: Operation
  // eslint-disable-next-line no-use-before-define
  private readonly _stream: Stream & { step: Step }

  constructor({
    args,
    basePath,
    children,
    context,
    loaderRegistry,
    logger,
    operation,
    ptr,
    stream,
    variables,
  }: StepOptions) {
    super({ basePath, children, context, loaderRegistry, logger, ptr, variables })

    this.args = args
    this.operation = operation
    this._stream = stream as unknown as Stream & { step: Step }

    if (typeof this._stream.step === 'undefined') {
      this._stream.step = this
    }

    // Create a span for this step
    this._span = tracer.startSpan(`Step <${this.ptr.value}>`, { attributes: { iri: this.ptr.value } })

    // TODO: record errors in the span
    const end = once(() => this._span.end())

    // End it either on the 'end' event or when there is an error
    for (const event of ['end', 'error', 'close', 'destroy']) {
      stream.on(event, end)
    }

    // Record some events from the stream
    for (const event of ['pipe', 'resume']) {
      stream.on(event, () => this._span.addEvent(event))
    }

    this.logger.trace({ iri: this.ptr.value, message: 'created new Step' })
  }

  get stream() {
    return this._stream
  }
}

export default Step
