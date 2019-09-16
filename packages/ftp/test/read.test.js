/* global describe, expect, it */

const read = require('../read')
const FtpServer = require('./support/FtpServer')
const SftpServer = require('./support/SftpServer')
const { withServer } = require('./support/server')
const getStream = require('get-stream')
const each = require('jest-each').default

describe('read', () => {
  it('is a function', () => {
    expect(typeof read).toBe('function')
  })

  each([
    [() => new FtpServer()],
    [() => new FtpServer({ user: 'test', password: '1234' })],
    [() => new SftpServer()],
    [() => new SftpServer({ user: 'test', password: '1234' })]
  ]).it('read file from the given path', async (serverFactory) => {
    await withServer(serverFactory, async (server) => {
      const stream = await read({ filename: 'data/xyz.txt', ...server.options })
      const content = await getStream(stream)

      expect(content).toBe('987\n654')
    })
  })
})
