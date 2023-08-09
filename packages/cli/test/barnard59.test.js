import { strictEqual } from 'assert'
import { expect } from 'chai'
import shell from 'shelljs'
import stripAnsi from 'strip-ansi'
import filenamePipelineDefinition from './support/filenamePipelineDefinition.js'

const barnard59 = (new URL('../bin/barnard59.js', import.meta.url)).pathname
const cwd = new URL('..', import.meta.url).pathname

describe('barnard59', function () {
  this.timeout(10000)

  describe('run', () => {
    it('should exit with error code 0 if there are no error while processing the pipeline', () => {
      const pipelineFile = filenamePipelineDefinition('simple')
      const command = `${barnard59} run --pipeline=http://example.org/pipeline/ ${pipelineFile}`

      const result = shell.exec(command, { silent: true, cwd })

      strictEqual(result.code, 0)
    })

    it('should exit with error code 1 when an error in the pipeline occurs', () => {
      const pipelineFile = filenamePipelineDefinition('error')
      const command = `${barnard59} run --pipeline=http://example.org/pipeline/ ${pipelineFile}`

      const result = shell.exec(command, { silent: true, cwd })

      strictEqual(result.code, 1)
    })

    describe('verbose', () => {
      it('should log info messages if verbose flag is set', () => {
        const pipelineFile = filenamePipelineDefinition('simple')
        const command = `${barnard59} run --pipeline=http://example.org/pipeline/ --verbose ${pipelineFile}`

        const result = stripAnsi(shell.exec(command, { silent: true, cwd }).stderr)

        strictEqual((/^info: /m).test(result), true)
      })

      it('should log info messages if verbose flag is set before command', () => {
        const pipelineFile = filenamePipelineDefinition('simple')
        const command = `${barnard59} --verbose run --pipeline=http://example.org/pipeline/ ${pipelineFile}`

        const result = stripAnsi(shell.exec(command, { silent: true, cwd }).stderr)

        strictEqual((/^info: /m).test(result), true)
      })

      it('should not log debug messages if verbose flag is set', () => {
        const pipelineFile = filenamePipelineDefinition('simple')
        const command = `${barnard59} run --pipeline=http://example.org/pipeline/ --verbose ${pipelineFile}`

        const result = stripAnsi(shell.exec(command, { silent: true, cwd }).stderr)

        strictEqual((/^debug: /m).test(result), false)
      })

      it('should log debug messages if verbose flag is set twice', () => {
        const pipelineFile = filenamePipelineDefinition('simple')
        const command = `${barnard59} run --pipeline=http://example.org/pipeline/ --verbose --verbose ${pipelineFile}`

        const result = stripAnsi(shell.exec(command, { silent: true, cwd }).stderr)

        strictEqual((/^debug: /m).test(result), true)
      })
    })

    describe('variable', () => {
      it('should set the given variable to the given value', () => {
        const pipelineFile = filenamePipelineDefinition('simple')
        const command = `${barnard59} run --pipeline=http://example.org/pipeline/ --verbose ${pipelineFile} --variable=abc=123`

        const result = stripAnsi(shell.exec(command, { silent: true, cwd }).stderr)

        strictEqual(result.includes('abc: 123'), true)
      })

      it('should set the given variable to the given value before command', () => {
        const pipelineFile = filenamePipelineDefinition('simple')
        const command = `${barnard59} --variable=abc=123 run --pipeline=http://example.org/pipeline/ --verbose ${pipelineFile}`

        const result = stripAnsi(shell.exec(command, { silent: true, cwd }).stderr)

        strictEqual(result.includes('abc: 123'), true)
      })

      it('should set the given variable to the value of the environment variable with the same name', () => {
        const pipelineFile = filenamePipelineDefinition('simple')
        const command = `abc=123 ${barnard59} run --pipeline=http://example.org/pipeline/ --verbose ${pipelineFile} --variable=abc`

        const result = stripAnsi(shell.exec(command, { silent: true, cwd }).stderr)

        strictEqual(result.includes('abc: 123'), true)
      })
    })

    describe('variable-all', () => {
      it('should import all environment variables', () => {
        const pipelineFile = filenamePipelineDefinition('simple')
        const command = `abc=123 def=456 ${barnard59} run --pipeline=http://example.org/pipeline/ -vv ${pipelineFile} --variable-all`

        const result = stripAnsi(shell.exec(command, { silent: true }).stderr)

        expect(result).to.match(/info:.+abc: 123/)
        expect(result).to.match(/debug:.+def: 456/)
      })

      it('should import all environment variables before command', () => {
        const pipelineFile = filenamePipelineDefinition('simple')
        const command = `abc=123 def=456 ${barnard59} --variable-all run --pipeline=http://example.org/pipeline/ -vv ${pipelineFile}`

        const result = stripAnsi(shell.exec(command, { silent: true }).stderr)

        expect(result).to.match(/info:.+abc: 123/)
        expect(result).to.match(/debug:.+def: 456/)
      })
    })
  })

  describe('examples', function () {
    // Examples can be a bit slow to run
    this.timeout(5000)

    it('should run the fetch-json-to-ntriples.json example without error', () => {
      const pipelineFile = (new URL('../examples/fetch-json-to-ntriples.json', import.meta.url)).pathname
      const command = `${barnard59} run --pipeline=http://example.org/pipeline/cet ${pipelineFile}`

      const result = shell.exec(command, { silent: true, cwd })

      strictEqual(result.code, 0)
    })

    it('should run the fetch-json-to-ntriples.ttl example without error', () => {
      const pipelineFile = (new URL('../examples/fetch-json-to-ntriples.ttl', import.meta.url)).pathname
      const command = `${barnard59} run --pipeline=http://example.org/pipeline/utc ${pipelineFile}`

      const result = shell.exec(command, { silent: true, cwd })

      strictEqual(result.code, 0)
    })

    it('should run the parse-csvw.ttl example without error', () => {
      const pipelineFile = (new URL('../examples/parse-csvw.ttl', import.meta.url)).pathname
      const command = `${barnard59} run -vv --pipeline=http://example.org/pipeline/parseCsvw ${pipelineFile}`

      const result = shell.exec(command, { silent: true, cwd })

      strictEqual(result.code, 0)
    })
  })
})
