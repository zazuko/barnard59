const cf = require('clownface')
const fromFile = require('rdf-utils-fs/fromFile')
const fs = require('fs')
const namespace = require('@rdfjs/namespace')
const rdf = require('rdf-ext')
const readline = require('readline')

const ns = {
  schema: namespace('http://schema.org/'),
  rdf: namespace('http://www.w3.org/1999/02/22-rdf-syntax-ns#'),
  p: namespace('https://pipeline.described.at/'),
  code: namespace('https://code.described.at/')
}

const pipelineFile = 'sample-pipelines/fetch-json-to-ntriples.ttl'
const errors = []

async function readGraph (file) {
  const quadStream = fromFile(file)
  const parserPromise = new Promise((resolve, reject) => {
    quadStream.on('error', reject)
    quadStream.on('end', resolve)
  })
  const datasetPromise = rdf.dataset().import(quadStream)

  let dataset, _err
  try {
    [_err, dataset] = await Promise.all([parserPromise, datasetPromise])
  }
  catch (err) {
    const error = await parseError(file, err)
    errors.push(error)
  }

  if (errors.length) {
    const error = errors[0]
    console.error(`${error.message} Line ${error.context.line}: \n${error.context.lineContent}`)
    throw error
  }

  const clownfaceObj = cf({ dataset })

  return clownfaceObj
}

async function parseError (path, error) {
  const { line, token: _token } = error.context
  if (typeof line === 'number') {
    const rl = readline.createInterface({
      input: fs.createReadStream(path),
      output: process.stdout,
      terminal: false
    })

    let lineNumber = 0
    rl.on('line', (lineContent) => {
      lineNumber++
      if (lineNumber === line) {
        error.context.lineContent = lineContent
        rl.close()
      }
    })
    return new Promise((resolve) => rl.on('close', () => resolve(error)))
  }
}

async function getPipelines (graph) {
  const pipelines = []
  graph
    .has(ns.rdf.type, ns.p.Pipeline)
    .forEach(pipeline => {
      pipelines.push(pipeline.term.value)
    })

  return pipelines
}

async function getIdentifiers (graph) {
  const pipeline2identifier = {}

  graph
    .has(ns.rdf.type, ns.p.Pipeline)
    .forEach(pipeline => {
      const steps = pipeline
        .out(ns.p.steps)
        .out(ns.p.stepList)
        .list()

      pipeline2identifier[pipeline.term.value] = []

      for (const step of steps) {
        const identifier = step
          .out(ns.code.implementedBy)
          .out(ns.code.link)
          .term
        pipeline2identifier[pipeline.term.value].push(identifier.value)
      }
    })

  return pipeline2identifier
}

async function main () {
  try {
    const graph = await readGraph(pipelineFile)
    const steps = getIdentifiers(graph)

    console.log(steps)
  }
  catch (_err) {}
}
main()
