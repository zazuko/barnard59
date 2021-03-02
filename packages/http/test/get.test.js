import { get } from '../index.js'
import chunksAndContent from './support/chunksAndContent.js'
import { isReadable, isWritable } from 'isstream'
import streamToString from './support/streamToString.js'
import ExpressAsPromise from 'express-as-promise'
import { expect } from 'chai'

describe('get', () => {
  it('returns only a readable stream', async () => {
    const server = new ExpressAsPromise()
    const baseUrl = await server.listen()

    const response = await get({ url: baseUrl })

    expect(isReadable(response)).to.equal(true)
    expect(isWritable(response)).to.equal(false)

    await server.stop()
  })

  it('provides the response content as stream', async () => {
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

    expect(content).to.equal(expected.content)

    await server.stop()
  })
})
