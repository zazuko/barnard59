import { deepStrictEqual, rejects, strictEqual } from 'assert'
import { getStreamAsArray } from 'get-stream'
import semver from 'semver'
import list from '../list.js'
import FtpServer from './support/FtpServer.js'
import { withServer } from './support/server.js'
import serverConfigurations from './support/serverConfigurations.js'

const isNode24OrNewer = semver.gte(process.versions.node, '24.0.0')

describe('list', function () {
  it('is a function', () => {
    strictEqual(typeof list, 'function')
  })

  serverConfigurations.forEach(([label, serverFactory, additionalOptions]) => {
    it(`lists files from the given directory ${label}`, async function () {
      if (isNode24OrNewer) {
        // ssh2 does not work with node 24+
        this.skip()
      }

      await withServer(serverFactory, async server => {
        const options = { ...server.options, ...additionalOptions }

        const stream = await list({ pathname: 'data', ...options })
        const filenames = await getStreamAsArray(stream)

        deepStrictEqual(filenames, ['data/abc.txt', 'data/xyz.txt'])
      })
    })
  })

  it('throws proper error when file does not exist', async () => {
    await withServer(() => new FtpServer(), async server => {
      await rejects(async () => {
        await list({ pathname: 'does-not-exist', ...server.options })
      }, err => {
        return err.message.includes('no such file or directory')
      })
    })
  })
})
