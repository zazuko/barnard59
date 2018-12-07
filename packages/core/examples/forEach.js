const fs = require('fs')
const path = require('path')
const pipeline = require('..').pipeline
const rdf = require('rdf-ext')
const run = require('..').run
const Parser = require('@rdfjs/parser-n3')

async function buildDefinition () {
  const dataset = rdf.dataset()
  await dataset.import(new Parser().import(fs.createReadStream(path.resolve(__dirname, 'forEach.ttl'))))

  return {
    dataset,
    iri: 'http://example.org/pipeline#pipeline'
  }
}

buildDefinition()
  .then(def => pipeline(def.dataset, { iri: def.iri, basePath: __dirname }).pipe(process.stdout))
  .then(test => run(test))
  .catch(err => console.error(err))
