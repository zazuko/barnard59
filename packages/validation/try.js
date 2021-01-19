const parser = require('./lib/parser')
const errors = []

const file = 'sample-pipelines/multiple-pipelines.ttl'
async function main (file) {
  const pipelineGraph = await parser.readGraph(file, errors)
  const pipelines = parser.getIdentifiers(pipelineGraph)
  const codelinks = parser.getAllCodeLinks(pipelines)
  const dependencies = parser.getDependencies(codelinks)
  parser.validateDependencies(dependencies, errors)

  const operationProperties = await parser.getAllOperationProperties(dependencies, errors)
  parser.validateSteps({ pipelines, properties: operationProperties }, errors)

  const pipelineProperties = parser.getPipelineProperties(pipelineGraph, Object.keys(pipelines))
  parser.validatePipelines(pipelines, operationProperties, pipelineProperties)
}
main(file)
