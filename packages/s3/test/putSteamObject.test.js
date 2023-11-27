// @ts-check
import { Readable } from 'stream'
import { createWriteStream } from 'fs'
import { readFile } from 'fs/promises'
import { strictEqual } from 'assert'
import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3'
import { mockClient } from 'aws-sdk-client-mock'
import { putStreamObject } from '../index.js'
import { ensureFileDirectoryExists } from '../lib/paths.js'
import { removeResultsDirectory, testResultsDirectory } from './utils.js'

describe('putStreamObject', async () => {
  let s3Mock

  before(async () => {
    s3Mock = mockClient(S3Client)
    await removeResultsDirectory()
  })

  after(async () => {
    s3Mock.restore()
    await removeResultsDirectory()
  })

  it('should be able to put a stream into a S3 bucket', async () => {
    const data = 'Hello world'
    const uploadPath = `${testResultsDirectory}/putStreamObject/uploaded-file.txt`

    // Create Stream from string
    const stream = new Readable()
    stream.push(data)
    stream.push(null) // End of the stream

    await ensureFileDirectoryExists(uploadPath)

    s3Mock.on(PutObjectCommand).callsFakeOnce((command) => {
      strictEqual(command.Key, 'uploaded-file.txt')
      strictEqual(command.Bucket, 'test-bucket')
      strictEqual(command.Body instanceof Readable, true)
      const stream = createWriteStream(uploadPath)
      command.Body.pipe(stream)
    })

    await putStreamObject({
      bucket: 'test-bucket',
      key: 'uploaded-file.txt',
      stream,
    })

    // fake sleep to wait for stream to finish
    await new Promise((resolve) => setTimeout(resolve, 0))

    const fileContent = await readFile(uploadPath, 'utf8')
    strictEqual(fileContent, data)
  })
})
