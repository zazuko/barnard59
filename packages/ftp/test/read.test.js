import { strictEqual } from 'assert'
import { readFileSync } from 'fs'
import getStream from 'get-stream'
import { describe, it } from 'mocha'
import read from '../read.js'
import FtpServer from './support/FtpServer.js'
import { withServer } from './support/server.js'
import SftpServer from './support/SftpServer.js'

describe('read', () => {
  it('is a function', () => {
    strictEqual(typeof read, 'function')
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
    it(`read file from the given path ${label}`, async () => {
      await withServer(serverFactory, async server => {
        const options = { ...server.options, ...additionalOptions }

        const stream = await read({ filename: 'data/xyz.txt', ...options })
        const content = await getStream(stream)

        strictEqual(content, '987\n654')
      })
    })
  })
})
