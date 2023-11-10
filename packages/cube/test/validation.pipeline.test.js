import { strictEqual, ok } from 'assert'
import shell from 'shelljs'

const barnard59 = (new URL('../../../packages/cli/bin/barnard59.js', import.meta.url)).pathname
const support = (new URL('./support', import.meta.url)).pathname
const cwd = new URL('..', import.meta.url).pathname

describe('cube validation pipeline', function () {
  this.timeout(10000)

  it('should run check-cube-observations pipeline without error', () => {
    const pipelineFile = (new URL('../pipeline/cube-validation.ttl', import.meta.url)).pathname
    const pipelineURI = 'http://barnard59.zazuko.com/pipeline/cube-validation/check-cube-observations'
    const constraintFile = `${support}/constraint01.ttl`
    const command = `cat ${support}/observations01.ttl | ${barnard59} run ${pipelineFile} --pipeline=${pipelineURI} --variable constraint=${constraintFile}`

    const result = shell.exec(command, { silent: true, cwd })

    strictEqual(result.code, 0)
    strictEqual(result.stderr, '')
    strictEqual(result.stdout, '')
  })

  it('should run check-cube-observations pipeline with error', () => {
    const pipelineFile = (new URL('../pipeline/cube-validation.ttl', import.meta.url)).pathname
    const pipelineURI = 'http://barnard59.zazuko.com/pipeline/cube-validation/check-cube-observations'
    const constraintFile = `${support}/constraint01.ttl`
    const command = `cat ${support}/observations02.ttl | ${barnard59} run ${pipelineFile} --pipeline=${pipelineURI} --variable constraint=${constraintFile}`

    const result = shell.exec(command, { silent: true, cwd })

    strictEqual(result.code, 1)
    ok(result.stderr.startsWith('Error: At least 1 violations found'))
    ok(result.stdout.includes('_:report <http://www.w3.org/ns/shacl#conforms> "false"^^<http://www.w3.org/2001/XMLSchema#boolean>'))
  })
})
