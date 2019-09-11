/* global describe, expect, it */

const read = require('../read')
const FtpServer = require('./support/FtpServer')
const getStream = require('get-stream')

describe('read', () => {
  it('is a function', () => {
    expect(typeof read).toBe('function')
  })

  it('read file from the given path with anonymous user', async () => {
    const server = new FtpServer()
    await server.start()

    const stream = await read({ filename: 'data/xyz.txt', ...server.options })
    const content = await getStream(stream)

    await server.stop()

    expect(content).toBe('987\n654')
  })

  it('read file from the given path with user/password', async () => {
    const server = new FtpServer({ user: 'test', password: '1234' })
    await server.start()

    const stream = await read({ filename: 'data/xyz.txt', ...server.options })
    const content = await getStream(stream)

    await server.stop()

    expect(content).toBe('987\n654')
  })
})
