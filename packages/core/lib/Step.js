import StreamObject from './StreamObject.js'

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

    this.logger.info({ iri: this.ptr.value, message: 'created new Step' })
  }
}

export default Step
