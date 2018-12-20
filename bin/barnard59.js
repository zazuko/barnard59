#!/usr/bin/env node

const fs = require('fs')
const p = require('..')
const path = require('path')
const program = require('commander')
const cf = require('clownface')
const rdf = require('rdf-ext')
const namespace = require('@rdfjs/namespace')

const ns = {
  p: namespace('https://pipeline.described.at/'),
  rdf: namespace('http://www.w3.org/1999/02/22-rdf-syntax-ns#')
}

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

function guessPipeline (dataset) {
  const graph = cf(dataset)

  const pipelines = graph.has(ns.rdf('type'), [ ns.p('Pipeline'), ns.p('ObjectPipeline') ])

  if (pipelines.values.length === 0) {
    throw new Error('no pipeline found in the dataset')
  }

  const rootPipelines = pipelines.values.reduce((arr, id) => {
    const node = dataset.match(null, null, rdf.namedNode(id), null)

    if (node.length === 0) {
      arr.push(id)
    }

    return arr
  }, [])

  if (rootPipelines.length > 1) {
    throw new Error('multiple root pipeline found. please specify the one to run using --pipeline option')
  }

  return rootPipelines[0]
}

program
  .command('run <filename>')
  .option('--format <mediaType>', 'media type of the pipeline description', 'application/ld+json')
  .option('--output [filename]', 'output file', '-')
  .option('--pipeline [iri]', 'IRI of the pipeline description')
  .option('--variable <name=value>', 'variable key value pairs separated by comma', parseVariables)
  .action((filename, { format, output, pipeline, variable } = {}) => {
    p.fileToDataset(format, filename)
      .then(dataset => {
        if (!pipeline) {
          pipeline = guessPipeline(dataset)
        }

        const stream = p.pipeline(dataset, pipeline, {
          basePath: path.resolve(path.dirname(filename)),
          variables: variable
        })

        stream.pipe(createOutputStream(output))

        return p.run(stream)
      }).catch(err => console.error(err))
  })

program.parse(process.argv)
