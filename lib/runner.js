const p = require('..')
const cf = require('clownface')
const rdf = require('rdf-ext')
const namespace = require('@rdfjs/namespace')
const TextLogStream = require('../lib/TextLogStream')

const ns = {
  p: namespace('https://pipeline.described.at/'),
  rdf: namespace('http://www.w3.org/1999/02/22-rdf-syntax-ns#')
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

function create ({ basePath, outputStream, pipeline, variable, verbose, log } = {}) {
  log = log || function () { }

  return function runner (dataset) {
    if (!pipeline) {
      pipeline = guessPipeline(dataset)
    }

    if (verbose) {
      log('variables via CLI:\n')

      for (const [key, value] of variable) {
        log(`  ${key}: ${value}\n`)
      }
    }

    const stream = p.pipeline(dataset, pipeline, {
      basePath,
      variables: variable
    })

    if (verbose) {
      log('variables in pipeline instance:\n')

      for (const [key, value] of stream.variables) {
        log(`  ${key}: ${value}\n`)
      }
    }

    stream.on('error', err => {
      throw err
    })

    stream.pipe(outputStream)

    if (verbose) {
      stream.context.log.pipe(new TextLogStream()).pipe(log)
    }

    return p.run(stream)
  }
}

module.exports = {
  create
}
