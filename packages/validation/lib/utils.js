const path = require('path')

function removeFilePart (dirname) {
  return path.parse(dirname).dir
}

function countValidationIssues (errors, verbose = false) {
  const collectedIssues = []
  errors.forEach((error) => {
    if (Array.isArray(error)) {
      const [, pipelineErrors] = error
      pipelineErrors.forEach((error, j) => {
        collectedIssues.push(error.level)
      })
    }
    else {
      collectedIssues.push(error.level)
    }
  })
  if (verbose) {
    return collectedIssues.length
  }
  return collectedIssues.filter(level => level === 'error').length
}

module.exports = {
  removeFilePart,
  countValidationIssues
}
