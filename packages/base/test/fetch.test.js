const { strictEqual } = require('assert')
const { isReadable, isWritable } = require('isstream')
const { describe, it } = require('mocha')
const fetch = require('../lib/fetch')
const streamToString = require('./support/streamToString')
const ExpressServer = require('./support/ExpressServer')

describe('fetch', () => {
  it('should be a function', () => {
    strictEqual(typeof fetch, 'function')
  })

  it('should return a readable stream', async () => {
    const server = new ExpressServer()
    const baseUrl = await server.start()

    const response = await fetch(baseUrl)

    strictEqual(isReadable(response), true)
    strictEqual(isWritable(response), false)

    await server.stop()
  })

  it('should forwards the chunks of the stream', async () => {
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

    strictEqual(await streamToString(response), expectedContent)

    await server.stop()
  })
})
