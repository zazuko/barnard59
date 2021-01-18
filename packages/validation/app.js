const parser = require('./lib/parser')
const { Command } = require('commander')
const { version } = require('.')

const program = new Command()
program.version(version)

async function main (file, options) {
  const errors = []
  try {
    const pipelineGraph = await parser.readGraph(file, errors)
    const pipelines = parser.getIdentifiers(pipelineGraph, options.pipeline)
    const codelinks = parser.getAllCodeLinks(pipelines)
    const dependencies = parser.getDependencies(codelinks)
    parser.validateDependencies(dependencies, errors)

    const stepProperties = await parser.getAllOperationProperties(dependencies, errors, options.verbose)
    parser.validateSteps({ pipelines, properties: stepProperties }, errors, options.verbose)
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
  .option('-p, --pipeline <pipelineIRI>', 'pipeline iri', null)
  .option('-v, --verbose', 'show all warning messages', false)
  .action((pipelineFile, options) => {
    main(pipelineFile, options)
  })
program.parse()
