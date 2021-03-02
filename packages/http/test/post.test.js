import { post } from '../index.js'
import chunksAndContent from './support/chunksAndContent.js'
import { isReadable, isWritable } from 'isstream'
import streamToString from './support/streamToString.js'
import ExpressAsPromise from 'express-as-promise'
import { expect } from 'chai'

describe('post', () => {
  it('returns a duplex stream', async () => {
    const server = new ExpressAsPromise()

    server.app.post('/', (req, res) => {
      res.status(204).end()
    })

    const baseUrl = await server.listen()
    const stream = await post({ url: baseUrl })

    expect(isReadable(stream)).to.equal(true)
    expect(isWritable(stream)).to.equal(true)

    stream.end()

    await streamToString(stream)

    await server.stop()
  })

  it('sends the stream to the server', async () => {
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

    expect(content).to.equal(expected.content)

    await server.stop()
  })
})
