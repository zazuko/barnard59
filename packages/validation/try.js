const parser = require('./lib/parser')
const errors = []

const file = 'sample-pipelines/multiple-pipelines.ttl'
async function main (file) {
  const pipelineGraph = await parser.readGraph(file, errors)
  const pipelines = parser.getIdentifiers(pipelineGraph)
  const codelinks = parser.getAllCodeLinks(pipelines)
  const dependencies = parser.getDependencies(codelinks)
  parser.validateDependencies(dependencies, errors)

  const pipelineProperties = parser.getPipelineProperties(pipelineGraph, Object.keys(pipelines))
  const operationProperties = await parser.getAllOperationProperties(dependencies, errors)
  parser.validateSteps({ pipelines, properties: operationProperties }, errors)

  console.log(pipelines)
  console.log(pipelineProperties)
  console.log(operationProperties)
}
main(file)
