import chaiExec from '@jsdevtools/chai-exec'
import chai from 'chai'
const { assert } = chai

chai.use(chaiExec)
chaiExec.defaults = {
  command: './cli.js',
  options: {
    env: {
      ...process.env,
      NODE_OPTIONS: '--no-warnings --loader ts-node/esm',
    },
  },
}

describe('barnard59-validate', function () {
  this.timeout(20000)

  it('should exit with a zero exit code', () => {
    const cli = chaiExec(' ./sample-pipelines/fetch-json-to-ntriples.ttl')
    assert.exitCode(cli, 0)

    const quiet = chaiExec('-q ./sample-pipelines/fetch-json-to-ntriples.ttl')
    assert.exitCode(quiet, 0)

    const verbose = chaiExec('-v ./sample-pipelines/fetch-json-to-ntriples.ttl')
    assert.exitCode(verbose, 0)
  })

  it('should exit with a non-zero exit code in strict mode', () => {
    const strict = chaiExec('-s ./sample-pipelines/fetch-json-to-ntriples.ttl')
    assert.exitCode(strict, 255)

    const strictQuiet = chaiExec('-sq ./sample-pipelines/fetch-json-to-ntriples.ttl')
    assert.exitCode(strictQuiet, 255)

    const strictVerbose = chaiExec('-sv ./sample-pipelines/fetch-json-to-ntriples.ttl')
    assert.exitCode(strictVerbose, 255)

    const strictQuietVerbose = chaiExec('-sqv ./sample-pipelines/fetch-json-to-ntriples.ttl')
    assert.exitCode(strictQuietVerbose, 255)
  })

  it('should report parsing errors', () => {
    const strict = chaiExec('./test/fixtures/invalid.ttl')
    assert.exitCode(strict, 255)

    const errors = JSON.parse(strict.stdout)
    assert.strictEqual(errors.length, 1)
    assert.ok(errors[0].message.startsWith('Cannot parse'))
    assert.strictEqual(errors[0].level, 'error')
  })

  it('should report file not found', () => {
    const strict = chaiExec('./test/-fixtures-/invalid.ttl')
    assert.exitCode(strict, 255)

    const errors = JSON.parse(strict.stdout)
    assert.strictEqual(errors.length, 1)
    assert.ok(errors[0].message.startsWith('ENOENT: no such file or directory'))
    assert.strictEqual(errors[0].level, 'error')
  })

  it('should not report warnings when quiet', () => {
    const exec = chaiExec('./sample-pipelines/fetch-json-to-ntriples.ttl')
    const warnings = JSON.parse(exec.stdout).filter(issue => issue.level === 'warning').length
    assert.ok(warnings > 0)

    const quiet = chaiExec('-q ./sample-pipelines/fetch-json-to-ntriples.ttl')
    const quietWarnings = JSON.parse(quiet.stdout).filter(issue => issue.level === 'warning').length
    assert.strictEqual(quietWarnings, 0)
  })

  it('should only report info when verbose', () => {
    const exec = chaiExec('./sample-pipelines/fetch-json-to-ntriples.ttl')
    const infos = JSON.parse(exec.stdout).filter(issue => issue.level === 'info').length
    assert.strictEqual(infos, 0)

    const verbose = chaiExec('-v ./sample-pipelines/fetch-json-to-ntriples.ttl')
    const verboseInfos = JSON.parse(verbose.stdout).filter(issue => issue.level === 'info').length
    assert.ok(verboseInfos > 0)
  })

  describe.skip('should validate manifests', () => {
    it('good', () => {
      const exec = chaiExec('-m ./test/fixtures/manifest-good.ttl')
      const infos = JSON.parse(exec.stdout).filter(issue => issue.level === 'info').length
      assert.strictEqual(infos, 0)
    })

    it('good, verbose', () => {
      const verbose = chaiExec('-m ./test/fixtures/manifest-good.ttl -v')
      const verboseInfos = JSON.parse(verbose.stdout).filter(issue => issue.level === 'info').length
      assert.ok(verboseInfos > 0)
    })

    it('bad', () => {
      const error = chaiExec('-m ./test/fixtures/manifest-bad.ttl')
      const errors = JSON.parse(error.stdout).filter(issue => issue.level === 'error').length
      assert.strictEqual(errors, 2)
    })
  })
})
