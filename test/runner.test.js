const { strictEqual } = require('assert')
const { describe, it } = require('mocha')
const { dirname, resolve } = require('path')
const rdf = require('rdf-ext')
const { fileToDataset } = require('..')
const { create } = require('../lib/runner')

describe('barnard59', () => {
  describe('run', () => {
    it('should emit an error if an error in the pipeline occurs', async () => {
      const pipelineFile = resolve(__dirname, 'support/error.ttl')
      const dataset = await fileToDataset('text/turtle', pipelineFile)
      const run = create({
        dataset,
        term: rdf.namedNode('http://example.org/pipeline'),
        outputStream: process.stdout,
        basePath: dirname(pipelineFile)
      })

      try {
        await run.promise
      } catch (err) {
        strictEqual(err.message, 'error in pipeline step http://example.org/error')
      }
    })
  })
})
