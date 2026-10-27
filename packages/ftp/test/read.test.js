import { strictEqual } from 'node:assert'
import assertThrows from 'assert-throws-async'
import getStream from 'get-stream'
import read from '../read.js'
import { withServer } from './support/server.js'
import SftpServer from './support/SftpServer.js'
import serverConfigurations from './support/serverConfigurations.js'

describe('read', function () {
  it('is a function', function () {
    strictEqual(typeof read, 'function')
  })

  serverConfigurations.forEach(
    ([label, serverFactory, additionalOptions]) => {
      it(`read file from the given path ${label}`, async function () {
        await withServer(serverFactory, async (server) => {
          const options = { ...server.options, ...additionalOptions }

          const stream = await read({ filename: 'data/xyz.txt', ...options })
          const [content] = await Promise.all([
            getStream(stream),
            new Promise(resolve => stream.on('close', resolve)),
          ])

          strictEqual(content, '987\n654')
        })
      })
    })

  it('fails if key is malformed', async function () {
    const serverFactory = () => new SftpServer({ user: 'test', password: '1234' })
    const additionalOptions = {
      password: undefined,
      privateKey: 'malformed',
    }
    await withServer(serverFactory, async (server) => {
      const options = { ...server.options, ...additionalOptions }
      await assertThrows(async () => {
        await read({ filename: 'data/xyz.txt', ...options })
      }, Error, /Cannot parse privateKey/)
    })
  })
})
