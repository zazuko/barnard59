function buildErrorMessage (report) {
  return JSON.stringify(report.results.map(x => {
    const result = {}
    if (x.message && x.message.length > 0) {
      result.message = x.message.map(x => x.value)
    }
    if (x.path) {
      result.path = x.path.value
    }
    if (x.sourceShape) {
      result.sourceShape = x.sourceShape.value
    }
    // Mandatory fields
    result.focusNode = x.focusNode.value
    result.severity = x.severity.value
    result.sourceConstraintComponent = x.sourceConstraintComponent.value
    return result
  }))
}

export class ValidationError extends Error {
  constructor (report) {
    const message = buildErrorMessage(report)
    super(message)

    this.report = report
  }
}
