import once from 'lodash/once.js'
import StreamObject from './StreamObject.js'
import tracer from './tracer.js'

class Step extends StreamObject {
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
  }) {
    super({ basePath, children, context, loaderRegistry, logger, ptr, stream, variables })

    this.args = args
    this.operation = operation

    if (typeof stream.step === 'undefined') {
      stream.step = this
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

    this.logger.info({ iri: this.ptr.value, message: 'created new Step' })
  }
}

export default Step
