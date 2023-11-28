// @ts-check
import { Readable } from 'node:stream'
import { rejects, strictEqual } from 'node:assert'
import { GetObjectCommand, S3Client } from '@aws-sdk/client-s3'
import { sdkStreamMixin } from '@aws-sdk/util-stream-node'
import { mockClient } from 'aws-sdk-client-mock'
import { getStreamObject } from '../index.js'
import { toString } from '../lib/streams.js'
import { removeResultsDirectory } from './utils.js'

describe('getStreamObject', async () => {
  let s3Mock

  before(async () => {
    s3Mock = mockClient(S3Client)
    await removeResultsDirectory()
  })

  after(async () => {
    s3Mock.restore()
    await removeResultsDirectory()
  })

  it('should be able to get a stream from a file', async () => {
    const data = 'Hello world'

    // Create Stream from string
    const stream = new Readable()
    stream.push(data)
    stream.push(null) // End of the stream

    const sdkStream = sdkStreamMixin(stream)

    s3Mock.on(GetObjectCommand).resolves({ Body: sdkStream })

    const objectStream = await getStreamObject({
      bucket: 'test-bucket',
      key: 'get-a-file.txt',
    })

    const fileContent = await toString(objectStream)
    strictEqual(fileContent, data)
  })

  it('should throw in case of empty body', async () => {
    s3Mock.on(GetObjectCommand).resolves({ Body: null })

    await rejects(async () => {
      await getStreamObject({
        bucket: 'test-bucket',
        key: 'get-a-file.txt',
      })
    })
  })
})
