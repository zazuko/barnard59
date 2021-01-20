const path = require('path')

function removeFilePart (dirname) {
  return path.parse(dirname).dir
}

function printErrors (pipelines, errors, levels) {
  errors.filter(issue => !Array.isArray(issue))
    .filter(issue => levels.includes(issue.level))
    .forEach((issue) => {
      console.error(`- ${issue}`)
    })

  if (!pipelines) {
    return
  }

  Object.entries(pipelines)
    .forEach(([pipelineIRI, _steps], i) => {
      // TODO: group output per step
      const pipelineErrors = errorsForPipeline(pipelineIRI, errors, levels)
      if (pipelineErrors.length > 0) {
        console.error(`${i + 1}. In pipeline <${pipelineIRI}>`)
        pipelineErrors.forEach((issue, j) => {
          console.error(`${i + 1}.${j + 1}. ${issue}`)
        })
      }
    })
}

function errorsForPipeline (pipelineIRI, errors, levels) {
  const [_pipelineIRI, issues] = errors
    .filter(issue => Array.isArray(issue))
    .find(([pipeline, _pipelineErrors]) => pipeline === pipelineIRI)

  return issues.filter(issue => levels.includes(issue.level))
}

function countValidationIssues (errors, strict = false) {
  const collectedIssues = []
  errors.forEach((error) => {
    if (Array.isArray(error)) {
      const [, pipelineErrors] = error
      pipelineErrors.forEach((error) => {
        collectedIssues.push(error.level)
      })
    }
    else {
      collectedIssues.push(error.level)
    }
  })
  if (strict) {
    return collectedIssues
      .filter(level => ['warning', 'error'].includes(level))
      .length
  }
  return collectedIssues.filter(level => level === 'error').length
}

module.exports = {
  removeFilePart,
  printErrors,
  countValidationIssues
}
