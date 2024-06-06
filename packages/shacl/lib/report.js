import termToNt from '@rdfjs/to-ntriples'
import ValidationReport from 'rdf-validate-shacl/src/validation-report.js'

function validationResultToString(result) {
  const severity = result.severity.value.split('#')[1]
  const message = result.message.map(m => m.value).join(' ')
  const path = termToNt(result.path)
  const focusNode = termToNt(result.focusNode)
  const sourceConstraintComponent = result.sourceConstraintComponent.value.split('#')[1]
  const sourceShape = termToNt(result.sourceShape)

  return `${severity}: "${message}" at focus node ${focusNode} with path ${path} (${sourceConstraintComponent} of source: ${sourceShape})`
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

export function getSummary() {
  return async function * (stream) {
    let total = 0
    for await (const dataset of stream) {
      const messages = getMessages(new ValidationReport(this.env.clownface({ dataset })))
      total += messages.length
      yield messages
    }
    if (total) {
      this.error(new Error(`${total} violations found`))
    } else {
      yield 'successful\n'
    }
  }.bind(this)
}
