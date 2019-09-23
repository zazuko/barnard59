/* global describe, expect, it */

const list = require('../list')
const FtpServer = require('./support/FtpServer')
const getStream = require('get-stream')

describe('list', () => {
  it('is a function', () => {
    expect(typeof list).toBe('function')
  })

  it('lists files from the given directory with anonymous user', async () => {
    const server = new FtpServer()
    await server.start()

    const stream = await list({ pathname: 'data', ...server.options })
    const filenames = await getStream.array(stream)

    await server.stop()

    expect(filenames).toEqual(['data/abc.txt', 'data/xyz.txt'])
  })

  it('lists files from the given directory with user/password', async () => {
    const server = new FtpServer({ user: 'test', password: '1234' })
    await server.start()

    const stream = await list({ pathname: 'data', ...server.options })
    const filenames = await getStream.array(stream)

    await server.stop()

    expect(filenames).toEqual(['data/abc.txt', 'data/xyz.txt'])
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
