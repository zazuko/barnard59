const parser = require('./lib/parser')

const pipelineFile = 'sample-pipelines/fetch-json-to-ntriples.ttl'
// const pipelineFile = 'sample-pipelines/invalid.ttl'

async function main () {
  const errors = []
  try {
    const pipelineGraph = await parser.readGraph(pipelineFile, errors)
    const pipelines = parser.getIdentifiers(pipelineGraph)
    const codelinks = parser.getAllCodeLinks(pipelines)
    const dependencies = parser.getDependencies(codelinks)
    parser.validateDependencies(dependencies, errors)

    const stepProperties = await parser.getAllOperationProperties(dependencies, errors)
    parser.validateSteps({ pipelines, properties: stepProperties }, errors)
  }
  catch (_err) {}

  parser.printErrors(errors)
}
main()
