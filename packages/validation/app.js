const parser = require('./lib/parser')

const pipelineFile = 'sample-pipelines/fetch-json-to-ntriples.ttl'

async function main () {
  try {
    const pipelineGraph = await parser.readGraph(pipelineFile)
    const pipelines = parser.getIdentifiers(pipelineGraph)
    const codelinks = parser.getAllCodeLinks(pipelines)
    const dependencies = parser.getDependencies(codelinks)
    parser.validateDependencies(dependencies)

    const stepProperties = await parser.getAllOperationProperties(dependencies)
    console.log(codelinks)
    console.log(stepProperties)
  }
  catch (_err) {
    console.log(_err)
  }
}
main()
