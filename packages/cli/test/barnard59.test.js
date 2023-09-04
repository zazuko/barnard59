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
    it('should suggest alternatives when multiple root pipelines exist', () => {
      const pipelineFile = filenamePipelineDefinition('multiple-root')
      const command = `${barnard59} run ${pipelineFile}`

      const result = shell.exec(command, { silent: true, cwd })

      strictEqual(result.code, 1)
      expect(result.stdout).to.equal('Multiple root pipelines found. Try one of these:\n\t--pipeline http://example.org/pipeline/p1\n\t--pipeline http://example.org/pipeline/p2\n')
    })
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
        const pipelineFile = filenamePipelineDefinition('logs')
        const command = `${barnard59} run --pipeline=http://example.org/pipeline/ --verbose ${pipelineFile}`

        const result = stripAnsi(shell.exec(command, { cwd }).stderr)

        expect(result).to.match(/^info: /m)
      })

      it('all logs suppressed with --quiet flag', () => {
        const pipelineFile = filenamePipelineDefinition('logs')
        const command = `${barnard59} run --pipeline=http://example.org/pipeline/ --verbose ${pipelineFile} -q`

        const result = stripAnsi(shell.exec(command, { silent: true, cwd }).stderr)

        expect(result).to.be.empty
      })

      it('should log info messages if verbose flag is set before command', () => {
        const pipelineFile = filenamePipelineDefinition('logs')
        const command = `${barnard59} --verbose run --pipeline=http://example.org/pipeline/ ${pipelineFile}`

        const result = stripAnsi(shell.exec(command, { silent: true, cwd }).stderr)

        expect(result).to.match(/^info: /m)
      })

      it('should not log debug messages if verbose flag is set', () => {
        const pipelineFile = filenamePipelineDefinition('logs')
        const command = `${barnard59} run --pipeline=http://example.org/pipeline/ --verbose ${pipelineFile}`

        const result = stripAnsi(shell.exec(command, { silent: true, cwd }).stderr)

        expect(result).not.to.match(/^debug: /m)
      })

      it('should log trace messages if verbose flag is set 4 times', () => {
        const pipelineFile = filenamePipelineDefinition('logs')
        const command = `${barnard59} run --pipeline=http://example.org/pipeline/ -vvvv ${pipelineFile}`

        const result = stripAnsi(shell.exec(command, { silent: true, cwd }).stderr)

        expect(result).to.match(/^trace: /m)
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
        expect(result).to.match(/verbose:.+def: 456/)
      })

      it('should import all environment variables before command', () => {
        const pipelineFile = filenamePipelineDefinition('simple')
        const command = `abc=123 def=456 ${barnard59} --variable-all run --pipeline=http://example.org/pipeline/ -vv ${pipelineFile}`

        const result = stripAnsi(shell.exec(command, { silent: true }).stderr)

        expect(result).to.match(/info:.+abc: 123/)
        expect(result).to.match(/verbose:.+def: 456/)
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
