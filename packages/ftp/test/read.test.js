import { describe, it } from 'mocha'
import { readFileSync } from 'fs'
import read from '../read.js'
import FtpServer from './support/FtpServer.js'
import SftpServer from './support/SftpServer.js'
import { withServer } from './support/server.js'
import getStream from 'get-stream'
import { expect } from 'chai'

describe('read', () => {
  it('is a function', () => {
    expect(typeof read).to.equal('function')
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
      await withServer(serverFactory, async (server) => {
        const options = { ...server.options, ...additionalOptions }

        const stream = await read({ filename: 'data/xyz.txt', ...options })
        const content = await getStream(stream)

        expect(content).to.equal('987\n654')
      })
    })
  })
})
