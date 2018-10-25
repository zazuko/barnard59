#!/usr/bin/env node

const fs = require('fs')
const p = require('..')
const path = require('path')
const program = require('commander')

function createOutputStream (output) {
  if (output === '-') {
    return process.stdout
  }

  return fs.createWriteStream(output)
}

function parseVariables (str) {
  return str
    .split(',')
    .reduce((vars, nameValue) => {
      const [name, value] = nameValue.split('=')

      return vars.set(name, value)
    }, new Map())
}

program
  .command('run <filename>')
  .option('--format <mediaType>', 'media type of the pipeline description', 'application/ld+json')
  .option('--output [filename]', 'output file', '-')
  .option('--pipeline <iri>', 'IRI of the pipeline description')
  .option('--variable <name=value>', 'variable key value pairs separated by comma', parseVariables)
  .action((filename, { format, output, pipeline, variable } = {}) => {
    p.fileToDataset(format, filename)
      .then(dataset => {
        const stream = p.pipeline(dataset, {
          iri: pipeline,
          basePath: path.resolve(path.dirname(filename)),
          variables: variable
        })

        stream.pipe(createOutputStream(output))

        return p.run(stream)
      }).catch(err => console.error(err))
  })

program.parse(process.argv)
