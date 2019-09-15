/* global describe, expect, it */

const { resolve } = require('path')
const shell = require('shelljs')

const barnard59 = resolve(__dirname, '../bin/barnard59.js')

describe('barnard59', () => {
  describe('run', () => {
    it('should exit with error code 1 when an error in the pipeline occurs', () => {
      const pipelineFile = resolve(__dirname, 'support/error.ttl')
      const command = `${barnard59} run --format=text/turtle --pipeline=http://example.org/pipeline ${pipelineFile}`

      const result = shell.exec(command, { silent: true })

      expect(result.code).toBe(1)
    })
  })

  describe('examples', () => {
    it('should run the fetch-json-to-ntriples.json example without error', () => {
      const pipelineFile = resolve(__dirname, '../examples/fetch-json-to-ntriples.json')
      const command = `${barnard59} run --pipeline=http://example.org/pipeline/cet ${pipelineFile}`

      const result = shell.exec(command, { silent: true })

      expect(result.code).toBe(0)
    })

    it('should run the fetch-json-to-ntriples.ttl example without error', () => {
      const pipelineFile = resolve(__dirname, '../examples/fetch-json-to-ntriples.ttl')
      const command = `${barnard59} run --format=text/turtle --pipeline=http://example.org/pipeline/utc ${pipelineFile}`

      const result = shell.exec(command, { silent: true })

      expect(result.code).toBe(0)
    })

    it('should run the parse-csvw.ttl example without error', () => {
      const pipelineFile = resolve(__dirname, '../examples/parse-csvw.ttl')
      const command = `${barnard59} run --format=text/turtle --pipeline=http://example.org/pipeline/parseCsvw ${pipelineFile}`

      const result = shell.exec(command, { silent: true })

      expect(result.code).toBe(0)
    })
  })
})
