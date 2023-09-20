import { deepStrictEqual, rejects, strictEqual } from 'assert'
import getStream from 'get-stream'
import list from '../list.js'
import FtpServer from './support/FtpServer.js'
import { withServer } from './support/server.js'
import serverConfigurations from './support/serverConfigurations.js'

describe('list', () => {
  it('is a function', () => {
    strictEqual(typeof list, 'function')
  })

  serverConfigurations.forEach(([label, serverFactory, additionalOptions]) => {
    it(`lists files from the given directory ${label}`, async () => {
      await withServer(serverFactory, async server => {
        const options = { ...server.options, ...additionalOptions }

        const stream = await list({ pathname: 'data', ...options })
        const filenames = await getStream.array(stream)

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
