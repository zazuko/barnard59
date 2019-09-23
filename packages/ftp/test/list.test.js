/* global describe, expect, it */

const list = require('../list')
const FtpServer = require('./support/FtpServer')
const SftpServer = require('./support/SftpServer')
const { withServer } = require('./support/server')
const getStream = require('get-stream')

describe('list', () => {
  it('is a function', () => {
    expect(typeof list).toBe('function')
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
  ])('lists files from the given directory %s', async (label, serverFactory) => {
    await withServer(serverFactory, async (server) => {
      const stream = await list({ pathname: 'data', ...server.options })
      const filenames = await getStream.array(stream)

      expect(filenames).toEqual(['data/abc.txt', 'data/xyz.txt'])
    })
  })

  it('throws proper error when file does not exist', async () => {
    await withServer(() => new FtpServer(), async (server) => {
      await expect(list({ pathname: 'does-not-exist', ...server.options }))
        .rejects
        .toThrow('no such file or directory')
    })
  })
})
