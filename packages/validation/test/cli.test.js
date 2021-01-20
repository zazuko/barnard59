const { describe, it } = require('mocha')
const chaiExec = require('@jsdevtools/chai-exec')
const chai = require('chai')
const { assert } = chai

chai.use(chaiExec)
chaiExec.defaults = {
  command: './cli.js',
  args: './sample-pipelines/fetch-json-to-ntriples.ttl'
}

describe('barnard59-validate', () => {
  it('should exit with a zero exit code', () => {
    const cli = chaiExec()
    assert.exitCode(cli, 0)
    assert.stderr(cli, '')

    const quiet = chaiExec('-q')
    assert.exitCode(quiet, 0)
    assert.stderr(quiet, '')

    const verbose = chaiExec('-v')
    assert.exitCode(verbose, 0)
    assert.stderr(verbose, '')
  })

  it('should exit with a non-zero exit code in strict mode', () => {
    const strict = chaiExec('-s')
    assert.exitCode(strict, 255)
    assert.stderr(strict, '')

    const strictQuiet = chaiExec('-sq')
    assert.exitCode(strictQuiet, 255)
    assert.stderr(strictQuiet, '')

    const strictVerbose = chaiExec('-sv')
    assert.exitCode(strictVerbose, 255)
    assert.stderr(strictVerbose, '')

    const strictQuietVerbose = chaiExec('-sqv')
    assert.exitCode(strictQuietVerbose, 255)
    assert.stderr(strictQuietVerbose, '')
  })
})
