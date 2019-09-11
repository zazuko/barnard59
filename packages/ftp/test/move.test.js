/* global describe, expect, it */

const move = require('../move')
const fs = require('./support/fs')
const FtpServer = require('./support/FtpServer')
const getStream = require('get-stream')
const { resolve } = require('path')
const { Readable } = require('readable-stream')

describe('move', () => {
  it('is a function', () => {
    expect(typeof move).toBe('function')
  })

  it('moves a file from the given place to another place with anonymous user', async () => {
    const root = resolve(__dirname, 'support/tmp/move-anonymous')
    const original = resolve(__dirname, 'support/data/xyz.txt')
    const source = resolve(root, 'xyz.txt')
    const target = resolve(root, 'xyz.moved')
    await fs.rmdir(root)
    await fs.mkdir(root, { recursive: true })
    await fs.copyFile(original, source)

    const server = new FtpServer()
    await server.start()
    const input = new Readable({ read: () => input.push(null) })

    const stream = await move({ source: 'tmp/move-anonymous/xyz.txt', target: 'tmp/move-anonymous/xyz.moved', ...server.options })
    input.pipe(stream)
    await getStream(stream)
    const content = await fs.readFile(target)

    await server.stop()
    await fs.rmdir(root)

    expect(content.toString()).toBe('987\n654')
  })

  it('moves a file from the given place to another place with user/password', async () => {
    const root = resolve(__dirname, 'support/tmp/move-user')
    const original = resolve(__dirname, 'support/data/xyz.txt')
    const source = resolve(root, 'xyz.txt')
    const target = resolve(root, 'xyz.moved')
    await fs.rmdir(root)
    await fs.mkdir(root, { recursive: true })
    await fs.copyFile(original, source)

    const server = new FtpServer({ user: 'test', password: '1234' })
    await server.start()
    const input = new Readable({ read: () => input.push(null) })

    const stream = await move({ source: 'tmp/move-user/xyz.txt', target: 'tmp/move-user/xyz.moved', ...server.options })
    input.pipe(stream)
    await getStream(stream)
    const content = await fs.readFile(target)

    await server.stop()
    await fs.rmdir(root)

    expect(content.toString()).toBe('987\n654')
  })
})
