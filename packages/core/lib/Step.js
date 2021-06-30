import * as otel from '@opentelemetry/api'
import StreamObject from './StreamObject.js'
import tracer from './tracer.js'

class Step extends StreamObject {
  constructor ({
    args,
    basePath,
    children,
    context,
    loaderRegistry,
    logger,
    operation,
    ptr,
    stream,
    variables
  }) {
    super({ basePath, children, context, loaderRegistry, logger, ptr, stream, variables })

    this.args = args
    this.operation = operation

    if (typeof stream.step === 'undefined') {
      stream.step = this
    }

    // Create a span for this step
    this._span = tracer.startSpan(`Step <${this.ptr.value}>`, { attributes: { iri: this.ptr.value } })

    // End it either on the 'end' event or when there is an error
    stream.on('end', () => {
      this._span.setStatus({ code: otel.SpanStatusCode.OK })
      this._span.end()
    })
    stream.on('error', () => {
      this._span.setStatus({ code: otel.SpanStatusCode.ERROR })
      this._span.end()
    })

    // Count the number of chunks in that stream
    let chunks = 0
    stream.on('data', () => {
      if (chunks === 0) {
        this._span.addEvent('first chunk')
      }

      chunks++
      this._span.setAttribute('stream.chunks', chunks)
    })

    // Record some events from the stream
    for (const event of ['pipe', 'unpipe', 'pause', 'readable', 'resume']) {
      stream.on(event, () => this._span.addEvent(event, { 'stream.chunks': chunks }))
    }

    this.logger.info({ iri: this.ptr.value, message: 'created new Step' })
  }
}

export default Step
