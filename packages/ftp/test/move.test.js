/* global describe, expect, it */

const move = require('../move')
const fs = require('./support/fs')
const FtpServer = require('./support/FtpServer')
const SftpServer = require('./support/SftpServer')
const { withServer } = require('./support/server')
const getStream = require('get-stream')
const { resolve } = require('path')
const { Readable } = require('readable-stream')
const each = require('jest-each').default

describe('move', () => {
  it('is a function', () => {
    expect(typeof move).toBe('function')
  })

  each([
    [() => new FtpServer()],
    [() => new FtpServer({ user: 'test', password: '1234' })],
    [() => new SftpServer()],
    [() => new SftpServer({ user: 'test', password: '1234' })]
  ]).it('moves a file from the given place to another place', async (serverFactory) => {
    await withServer(serverFactory, async (server) => {
      const root = resolve(__dirname, 'support/tmp/move')
      const original = resolve(__dirname, 'support/data/xyz.txt')
      const source = resolve(root, 'xyz.txt')
      const target = resolve(root, 'xyz.moved')
      await fs.rmdir(root)
      await fs.mkdir(root, { recursive: true })
      await fs.copyFile(original, source)

      const input = new Readable({ read: () => input.push(null) })

      const stream = await move({ source: 'tmp/move/xyz.txt', target: 'tmp/move/xyz.moved', ...server.options })
      input.pipe(stream)
      await getStream(stream)
      const content = await fs.readFile(target)

      await fs.rmdir(root)

      expect(content.toString()).toBe('987\n654')
    })
  })
})
