class PipelineError extends Error {
  constructor(message: string, cause: Error) {
    super(message)

    if (cause) {
      this.stack += `\nCaused by: ${cause.stack}`
    }
  }
}

export default PipelineError
