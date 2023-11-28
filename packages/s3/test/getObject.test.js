// @ts-check
import { Readable } from 'node:stream'
import { readFile } from 'node:fs/promises'
import { rejects, strictEqual } from 'node:assert'
import { GetObjectCommand, S3Client } from '@aws-sdk/client-s3'
import { sdkStreamMixin } from '@aws-sdk/util-stream-node'
import { mockClient } from 'aws-sdk-client-mock'
import { getObject } from '../index.js'
import { removeResultsDirectory, testResultsDirectory } from './utils.js'

describe('getObject', async () => {
  let s3Mock

  before(async () => {
    s3Mock = mockClient(S3Client)
    await removeResultsDirectory()
  })

  after(async () => {
    s3Mock.restore()
    await removeResultsDirectory()
  })

  it('should be able to get a file', async () => {
    const data = 'Hello world'
    const filePath = `${testResultsDirectory}/getObject/get-a-file.txt`

    // Create Stream from string
    const stream = new Readable()
    stream.push(data)
    stream.push(null) // End of the stream

    const sdkStream = sdkStreamMixin(stream)

    s3Mock.on(GetObjectCommand).resolves({ Body: sdkStream })

    await getObject({
      bucket: 'test-bucket',
      key: 'get-a-file.txt',
      destinationPath: filePath,
    })

    const fileContent = await readFile(filePath, 'utf8')
    strictEqual(fileContent, data)
  })

  it('should throw for empty body', async () => {
    const filePath = `${testResultsDirectory}/getObject/get-empty-body.txt`

    s3Mock.on(GetObjectCommand).resolves({ Body: null })

    await rejects(async () => {
      await getObject({
        bucket: 'test-bucket',
        key: 'get-a-file.txt',
        destinationPath: filePath,
      })
    })
  })
})
