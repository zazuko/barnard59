import { strictEqual } from 'assert'
import withServer from 'express-as-promise/withServer.js'
import getStream from 'get-stream'
import { isReadable, isWritable } from 'isstream'
import { describe, it } from 'mocha'
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
})
