import path from 'path'
import assert from 'assert'
import * as url from 'url'
import validateManifest from '../lib/manifest.js'
import ChecksCollection from '../lib/checksCollection.js'

const __dirname = url.fileURLToPath(new URL('.', import.meta.url))

describe('manifest', () => {
  it('finds import errors', async () => {
    const checks = new ChecksCollection()
    const file = path.join(__dirname, './fixtures/manifest.ttl')
    await validateManifest({ file, checks })
    assert.ok(checks.generic.filter((issue) => issue.level === 'error').length === 1)
  })

  it('finds matching imports/exports', async () => {
    const checks = new ChecksCollection()
    const file = path.join(__dirname, './fixtures/manifest-good.ttl')
    await validateManifest({ file, checks })
    assert.ok(checks.generic.filter((issue) => issue.level === 'error').length === 0)
  })

  it('reports faulty imports/exports', async () => {
    const checks = new ChecksCollection()
    const file = path.join(__dirname, './fixtures/manifest-bad.ttl')
    await validateManifest({ file, checks })
    const errors = checks.generic.filter(issue => issue.level === 'error')
    assert.ok(errors.length === 2)
    const [error1, error2] = errors
    assert(error1.message.includes('does not export default'))
    assert(error2.message.includes('does not export namedimport'))
  })
})
