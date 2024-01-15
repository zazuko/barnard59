import termToNt from '@rdfjs/to-ntriples'
import rdf from 'barnard59-env'
import ValidationReport from 'rdf-validate-shacl/src/validation-report.js'

function validationResultToString(result) {
  const severity = result.severity.value.split('#')[1]
  const message = result.message.map(m => m.value).join(' ')
  const path = termToNt(result.path)
  const focusNode = termToNt(result.focusNode)
  const sourceConstraintComponent = result.sourceConstraintComponent.value.split('#')[1]
  const sourceShape = termToNt(result.sourceShape)

  return `${severity} of ${sourceConstraintComponent}: "${message}" with path ${path} at focus node ${focusNode} (source: ${sourceShape})`
}

function includeNestedResult(result) {
  const nestedResult = Object.keys(result.detail).length ? result.detail.map(includeNestedResult).flat() : []
  return [result].concat(nestedResult).flat()
}

function getMessages(report) {
  return report.results.flatMap(includeNestedResult)
    .map(validationResultToString)
    .map(message => message + '\n')
}

export function getSummary(dataset) {
  return getMessages(new ValidationReport(rdf.clownface({ dataset })))
}
