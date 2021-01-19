#!/usr/bin/env node
const path = require('path')
const { Command } = require('commander')
const parser = require('./lib/parser')
const { printErrors, countValidationIssues } = require('./lib/utils')
const { version } = require(path.join(__dirname, 'package.json'))

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

    const pipelineProperties = parser.getPipelineProperties(pipelineGraph, pipelines.keys())
    console.log(pipelineProperties)

    const stepProperties = await parser.getAllOperationProperties(dependencies, errors, options.verbose)
    console.log(stepProperties)
    parser.validateSteps({ pipelines, properties: stepProperties }, errors, options.verbose)
    console.log('Hello')
  }
  catch (_err) { }

  if (process.stdout.isTTY) {
    printErrors(errors)
  }
  else {
    console.log(JSON.stringify(errors))
  }

  if (countValidationIssues(errors, options.strict)) {
    process.exit(-1)
  }
}

program
  .arguments('<pipelineFile>')
  .option('-p, --pipeline <pipelineIRI>', 'pipeline IRI', null)
  .option('-s, --strict', 'warnings also produce an error exit status', false)
  .option('-v, --verbose', 'show all warning messages', false)
  .action((pipelineFile, options) => {
    if (options.strict) {
      options.verbose = true
    }
    main(pipelineFile, options)
  })
program.parse()
