/* global describe, expect, it */

const list = require('../list')
const FtpServer = require('./support/FtpServer')
const SftpServer = require('./support/SftpServer')
const { withServer } = require('./support/server')
const getStream = require('get-stream')
const each = require('jest-each').default

describe('list', () => {
  it('is a function', () => {
    expect(typeof list).toBe('function')
  })

  each([
    [() => new FtpServer()],
    [() => new FtpServer({ user: 'test', password: '1234' })],
    [() => new SftpServer()],
    [() => new SftpServer({ user: 'test', password: '1234' })]
  ]).it('lists files from the given directory', async (serverFactory) => {
    await withServer(serverFactory, async (server) => {
      const stream = await list({ pathname: 'data', ...server.options })
      const filenames = await getStream.array(stream)

      expect(filenames).toEqual(['data/abc.txt', 'data/xyz.txt'])
    })
  })

  it('throws proper error when file does not exist', async () => {
    const server = new FtpServer()
    await server.start()

    await expect(list({ pathname: 'does-not-exist', ...server.options }))
      .rejects
      .toThrow('no such file or directory')

    await server.stop()
  })
})
