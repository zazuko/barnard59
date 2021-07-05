import { deepStrictEqual, rejects, strictEqual } from 'assert'
import { readFileSync } from 'fs'
import getStream from 'get-stream'
import { describe, it } from 'mocha'
import list from '../list.js'
import FtpServer from './support/FtpServer.js'
import { withServer } from './support/server.js'
import SftpServer from './support/SftpServer.js'

describe('list', () => {
  it('is a function', () => {
    strictEqual(typeof list, 'function')
  })

  ;[
    [
      'on a FTP server with anonymous user',
      () => new FtpServer(),
      {}
    ],
    [
      'on a FTP server with username/password',
      () => new FtpServer({ user: 'test', password: '1234' }),
      {}
    ],
    [
      'on a SFTP server with anonymous user',
      () => new SftpServer(),
      {}
    ],
    [
      'on a SFTP server with username/password',
      () => new SftpServer({ user: 'test', password: '1234' }),
      {}
    ],
    [
      'on a SFTP server with private key',
      () => new SftpServer({ user: 'test', password: '1234' }),
      { password: undefined, privateKey: readFileSync('test/support/test.key') }
    ]
  ].forEach(([label, serverFactory, additionalOptions]) => {
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
