#!/usr/bin/env node
import 'anylogger-console'
import path from 'path'
import fs from 'fs'
import * as module from 'module'
import * as url from 'url'
import { Command } from 'commander'
import * as parser from './lib/parser.js'
import ChecksCollection from './lib/checksCollection.js'
import { removeFilePart } from './lib/utils.js'
import * as validate from './lib/manifest.js'
import { log } from './lib/log.js'

const require = module.createRequire(url.fileURLToPath(import.meta.url))
const { version } = JSON.parse(fs.readFileSync(require.resolve('./package.json')))

const program = new Command()
program.version(version)

async function validatePipeline(file, options) {
  const pipelineFile = path.resolve(file)
  const pipelineDir = removeFilePart(pipelineFile)
  const checks = new ChecksCollection()
  let pipelines
  try {
    const pipelineGraph = await parser.readGraph(pipelineFile, checks)
    pipelines = parser.getIdentifiers(pipelineGraph, checks, options.pipeline)
    const codelinks = parser.getAllCodeLinks(pipelines)
    const dependencies = parser.getDependencies(codelinks, pipelineDir)

    const operationProperties = await parser.getAllOperationProperties(dependencies, checks)
    parser.validateSteps({ pipelines, properties: operationProperties }, checks)

    const pipelineProperties = parser.getPipelineProperties(pipelineGraph, Object.keys(pipelines))
    parser.validatePipelines(pipelines, operationProperties, pipelineProperties, checks)
  } catch (err) {
    if (options.debug) {
      log.error(err)
    }
  }

  checks.print(options.levels)

  if (!process.stdout.isTTY) {
    log.log(checks.filterToJSON(options.levels))
  }

  if (checks.countIssues(options.strict)) {
    process.exit(-1)
  }
}

async function validateManifest(file, options) {
  const checks = new ChecksCollection()
  try {
    await validate({ file, checks })
  } catch (err) {
    if (options.debug) {
      console.error(err)
    }
  }

  checks.print(options.levels)

  if (!process.stdout.isTTY) {
    console.log(checks.filterToJSON(options.levels))
  }

  if (checks.countIssues(options.strict)) {
    process.exit(-1)
  }
}

program
  .arguments('<pipelineFile>')
  .option('-d, --debug', 'Shows debug information', false)
  .option('-m, --manifest', 'Validate a manifest.ttl instead of a pipeline', false)
  .option('-p, --pipeline <pipelineIRI>', 'Pipeline IRI', null)
  .option('-q, --quiet', 'Report errors only', false)
  .option('-s, --strict', 'Produce an error exit status on warnings', false)
  .option('-v, --verbose', 'Include successful validation checks in output', false)
  .action(async (file, options) => {
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
    if (!options.manifest) {
      validatePipeline(file, options)
    } else {
      await validateManifest(file, options)
    }
  })
program.parse()
