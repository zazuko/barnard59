/* global describe, expect, test */

const fetch = require('../lib/fetch')
const { isReadable, isWritable } = require('isstream')
const streamToString = require('./support/streamToString')
const ExpressServer = require('./support/ExpressServer')

describe('fetch', () => {
  test('returns only a readable stream', async () => {
    const server = new ExpressServer()
    const baseUrl = await server.start()

    const response = await fetch(baseUrl)

    expect(isReadable(response)).toBe(true)
    expect(isWritable(response)).toBe(false)

    await server.stop()
  })

  test('forwards the chunks of the stream', async () => {
    const expectedChunks = []

    for (let i = 0; i < 1000; i++) {
      expectedChunks.push(Buffer.from(i.toString()))
    }

    const expectedContent = Buffer.concat(expectedChunks).toString()

    const server = new ExpressServer()

    server.app.get('/', (req, res) => {
      expectedChunks.forEach(chunk => {
        res.write(chunk)
      })

      res.end()
    })

    const baseUrl = await server.start()
    const response = await fetch(baseUrl)

    expect(await streamToString(response)).toBe(expectedContent)

    await server.stop()
  })
})
