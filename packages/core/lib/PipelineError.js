class PipelineError extends Error {
  constructor(message, cause) {
    super(message)

    if (cause) {
      this.stack += `\nCaused by: ${cause.stack}`
    }
  }
}

export default PipelineError
