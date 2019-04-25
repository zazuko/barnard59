/* global describe, expect, test */

const { post } = require('..')
const chunksAndContent = require('./support/chunksAndContent')
const { isReadable, isWritable } = require('isstream')
const streamToString = require('./support/streamToString')
const ExpressAsPromise = require('express-as-promise')

describe('post', () => {
  test('returns a duplex stream', async () => {
    const server = new ExpressAsPromise()
    const baseUrl = await server.listen()

    const stream = await post({ url: baseUrl })

    expect(isReadable(stream)).toBe(true)
    expect(isWritable(stream)).toBe(true)

    stream.end()

    await server.stop()
  })

  test('sends the stream to the server', async () => {
    let content = null
    const expected = chunksAndContent()

    const server = new ExpressAsPromise()

    server.app.post('/', async (req, res) => {
      content = await streamToString(req)

      res.status(204).end()
    })

    const baseUrl = await server.listen()
    const stream = await post({ url: baseUrl })

    expected.chunks.forEach(chunk => {
      stream.write(chunk)
    })

    stream.end()

    await streamToString(stream)

    expect(content).toBe(expected.content)

    await server.stop()
  })
})
