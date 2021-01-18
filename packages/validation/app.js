const parser = require('./lib/parser')
const { Command } = require('commander')

const program = new Command()
program.version('0.1')

// const pipelineFile = 'sample-pipelines/fetch-json-to-ntriples.ttl'
// const pipelineFile = 'sample-pipelines/invalid.ttl'

async function main (file, pipeline2find = null) {
  const errors = []
  try {
    const pipelineGraph = await parser.readGraph(file, errors)
    const pipelines = parser.getIdentifiers(pipelineGraph, pipeline2find)
    const codelinks = parser.getAllCodeLinks(pipelines)
    const dependencies = parser.getDependencies(codelinks)
    parser.validateDependencies(dependencies, errors)

    const stepProperties = await parser.getAllOperationProperties(dependencies, errors)
    parser.validateSteps({ pipelines, properties: stepProperties }, errors)
  }
  catch (_err) {}

  if (process.stdout.isTTY) {
    parser.printErrors(errors)
  }
  else {
    console.log(JSON.stringify(errors))
  }
}

program
  .arguments('<pipelineFile>')
  .option('-p, --pipeline <pipelineIRI>', 'pipeline iri')
  .option('-v, --verbose', 'show all messages')
  .action((pipelineFile, options) => {
    if ('pipeline' in options) {
      main(pipelineFile, options.pipeline)
    }
    else {
      main(pipelineFile)
    }
  })
program.parse()
