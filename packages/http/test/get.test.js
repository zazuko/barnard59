/* global describe, expect, test */

const { get } = require('..')
const chunksAndContent = require('./support/chunksAndContent')
const { isReadable, isWritable } = require('isstream')
const streamToString = require('./support/streamToString')
const ExpressAsPromise = require('express-as-promise')

describe('get', () => {
  test('returns only a readable stream', async () => {
    const server = new ExpressAsPromise()
    const baseUrl = await server.listen()

    const response = await get({ url: baseUrl })

    expect(isReadable(response)).toBe(true)
    expect(isWritable(response)).toBe(false)

    await server.stop()
  })

  test('provides the response content as stream', async () => {
    const expected = chunksAndContent()
    const server = new ExpressAsPromise()

    server.app.get('/', (req, res) => {
      expected.chunks.forEach(chunk => {
        res.write(chunk)
      })

      res.end()
    })

    const baseUrl = await server.listen()
    const response = await get({ url: baseUrl })
    const content = await streamToString(response)

    expect(content).toBe(expected.content)

    await server.stop()
  })
})
