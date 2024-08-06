import { strictEqual } from 'node:assert'
import withServer from 'express-as-promise/withServer.js'
import getStream from 'get-stream'
import { isReadableStream as isReadable, isWritableStream as isWritable } from 'is-stream'
import get from '../get.js'
import chunksAndContent from './support/chunksAndContent.js'

describe('get', () => {
  it('returns only a readable stream', async () => {
    await withServer(async server => {
      const baseUrl = await server.listen()

      const response = await get({ url: baseUrl })

      strictEqual(isReadable(response), true)
      strictEqual(isWritable(response), false)
    })
  })

  it('provides the response content as stream', async () => {
    await withServer(async server => {
      const expected = chunksAndContent()

      server.app.get('/', (req, res) => {
        expected.stream.pipe(res)
      })

      const baseUrl = await server.listen()
      const response = await get({ url: baseUrl })
      const content = await getStream(response)

      strictEqual(content, expected.content)
    })
  })

  it('can be called with 2 arguments', async () => {
    await withServer(async server => {
      server.app.get('/', (req, res) => {
        res.send(req.headers['x-test'])
      })

      const baseUrl = await server.listen()
      const response = await get(baseUrl, { headers: { 'x-test': 'test header' } })
      const content = await getStream(response)

      strictEqual(content, 'test header')
    })
  })
})
