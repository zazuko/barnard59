/* global describe, expect, test */

const fetch = require('../lib/fetch')
const { isReadable, isWritable } = require('isstream')
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
})
