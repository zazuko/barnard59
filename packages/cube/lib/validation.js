import through2 from 'through2'

export function failOnViolations() {
  return through2.obj(function (chunk, _, next) {
    return next(null, chunk)
  }, (done) => {
    const violations = this.variables.get('violations')
    const maxViolations = this.variables.get('maxViolations') || 0

    if (violations && violations > maxViolations) {
      throw new Error(`${violations} violations found`)
    }
    done()
  })
}
