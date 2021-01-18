const path = require('path')

function removeFilePart (dirname) {
  return path.parse(dirname).dir
}

function printErrors (errors) {
  errors.forEach((error, i) => {
    if (Array.isArray(error)) {
      const [pipeline, pipelineErrors] = error
      if (pipelineErrors.length > 0) {
        console.error(`${i + 1}. In pipeline <${pipeline}>`)
        pipelineErrors.forEach((error, j) => {
          console.error(`${i + 1}.${j + 1}. ${error}`)
        })
      }
    }
    else {
      console.error(`${i + 1}. ${error}`)
    }
  })
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
  printErrors,
  countValidationIssues
}
