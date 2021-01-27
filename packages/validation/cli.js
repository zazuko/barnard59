#!/usr/bin/env node
const path = require('path')
const { Command } = require('commander')
const parser = require('./lib/parser')
const { printErrors, countValidationIssues } = require('./lib/utils')
const { version } = require(path.join(__dirname, 'package.json'))
const ChecksCollection = require('./lib/checksCollection.js')

const program = new Command()
program.version(version)

async function main (file, options) {
  const checks = new ChecksCollection()
  let pipelines
  try {
    const pipelineGraph = await parser.readGraph(file, checks)
    pipelines = parser.getIdentifiers(pipelineGraph, checks, options.pipeline)

    const codelinks = parser.getAllCodeLinks(pipelines)
    const dependencies = parser.getDependencies(codelinks)

    const operationProperties = await parser.getAllOperationProperties(dependencies, checks)
    parser.validateSteps({ pipelines, properties: operationProperties }, checks)

    const pipelineProperties = parser.getPipelineProperties(pipelineGraph, Object.keys(pipelines))
    parser.validatePipelines(pipelines, operationProperties, pipelineProperties, checks)
  }
  catch (err) {
    if (options.debug) {
      console.error(err)
    }
  }

  printErrors(checks, options.levels, true)

  if (!process.stdout.isTTY) {
    let arr1 = []
    for (const level of options.levels) {
      arr1 = arr1.concat(checks.getChecks(level))
    }
    console.log(JSON.stringify(arr1))
  }

  if (countValidationIssues(checks, options.strict)) {
    process.exit(-1)
  }
}

program
  .arguments('<pipelineFile>')
  .option('-d, --debug', 'Shows debug information', false)
  .option('-p, --pipeline <pipelineIRI>', 'Pipeline IRI', null)
  .option('-q, --quiet', 'Report errors only', false)
  .option('-s, --strict', 'Produce an error exit status on warnings', false)
  .option('-v, --verbose', 'Include successful validation checks in output', false)
  .action((pipelineFile, options) => {
    options.levels = ['error']
    if (!options.quiet) {
      options.levels.push('warning')
    }
    if (options.verbose) {
      options.levels.push('info')
    }
    if (options.strict) {
      options.verbose = true
    }
    main(pipelineFile, options)
  })
program.parse()
