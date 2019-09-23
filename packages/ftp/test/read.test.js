/* global describe, expect, it */

const read = require('../read')
const FtpServer = require('./support/FtpServer')
const SftpServer = require('./support/SftpServer')
const { withServer } = require('./support/server')
const getStream = require('get-stream')

describe('read', () => {
  it('is a function', () => {
    expect(typeof read).toBe('function')
  })

  it.each([
    [
      'on a FTP server with anonymous user',
      () => new FtpServer()
    ],
    [
      'on a FTP server with username/password',
      () => new FtpServer({ user: 'test', password: '1234' })
    ],
    [
      'on a SFTP server with anonymous user',
      () => new SftpServer()
    ],
    [
      'on a SFTP server with username/password',
      () => new SftpServer({ user: 'test', password: '1234' })
    ]
  ])('read file from the given path %s', async (label, serverFactory) => {
    await withServer(serverFactory, async (server) => {
      const stream = await read({ filename: 'data/xyz.txt', ...server.options })
      const content = await getStream(stream)

      expect(content).toBe('987\n654')
    })
  })
})
