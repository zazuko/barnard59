class StreamObject {
  constructor ({
    basePath,
    children = [],
    context = {},
    loaderRegistry,
    logger,
    ptr,
    variables = new Map(),
    stream
  }) {
    this.basePath = basePath
    this.children = children
    this.context = context
    this.loaderRegistry = loaderRegistry
    this.logger = logger
    this.ptr = ptr
    this.variables = variables
    this.stream = stream

    this.logger.debug({ iri: this.ptr.value, message: 'created new StreamObject' })
  }
}

export default StreamObject
