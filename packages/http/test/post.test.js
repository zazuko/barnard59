import { strictEqual } from 'assert'
import withServer from 'express-as-promise/withServer.js'
import getStream from 'get-stream'
import { isReadable, isWritable } from 'isstream'
import { describe, it } from 'mocha'
import post from '../post.js'
import chunksAndContent from './support/chunksAndContent.js'

describe('post', () => {
  it('returns a duplex stream', async () => {
    await withServer(async server => {
      server.app.post('/', (req, res) => {
        res.status(204).end()
      })

      const baseUrl = await server.listen()
      const stream = await post({ url: baseUrl })

      strictEqual(isReadable(stream), true)
      strictEqual(isWritable(stream), true)

      stream.end()

      await getStream(stream)
    })
  })

  it('sends the stream to the server', async () => {
    await withServer(async server => {
      let content = null
      const expected = chunksAndContent()

      server.app.post('/', async (req, res) => {
        content = await getStream(req)

        res.status(204).end()
      })

      const baseUrl = await server.listen()
      const stream = await post({ url: baseUrl })

      expected.stream.pipe(stream)

      await getStream(stream)

      strictEqual(content, expected.content)
    })
  })
})
