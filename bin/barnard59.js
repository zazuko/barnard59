#!/usr/bin/env node

const fs = require('fs')
const p = require('..')
const path = require('path')
const program = require('commander')
const runner = require('../lib/runner')

function createOutputStream (output) {
  if (output === '-') {
    return process.stdout
  }

  return fs.createWriteStream(output)
}

function parseVariables (str, all) {
  return str
    .split(',')
    .reduce((vars, nameValue) => {
      const [name, value] = nameValue.split('=')

      return vars.set(name, value)
    }, all)
}

program
  .command('run <filename>')
  .option('--format <mediaType>', 'media type of the pipeline description', 'application/ld+json')
  .option('--output [filename]', 'output file', '-')
  .option('--pipeline [iri]', 'IRI of the pipeline description')
  .option('--variable <name=value>', 'variable key value pairs separated by comma', parseVariables, new Map())
  .option('-v, --verbose', 'enable diagnostic console output')
  .action((filename, options = {}) => {
    const { format, output } = options
    p.fileToDataset(format, filename)
      .then(runner.create({
        ...options,
        outputStream: createOutputStream(output),
        log: process.stdout,
        basePath: path.resolve(path.dirname(filename))
      }))
      .catch(err => {
        console.error(err)
        process.exit(1)
      })
  })

program.parse(process.argv)
