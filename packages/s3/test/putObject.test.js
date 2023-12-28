// @ts-check
import { Readable } from 'node:stream'
import { createWriteStream } from 'node:fs'
import { readFile, writeFile } from 'node:fs/promises'
import { strictEqual } from 'node:assert'
import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3'
import { mockClient } from 'aws-sdk-client-mock'
import { putObject } from '../index.js'
import { ensureFileDirectoryExists } from '../lib/paths.js'
import { removeResultsDirectory, testResultsDirectory } from './utils.js'

describe('putObject', async () => {
  let s3Mock

  before(async () => {
    s3Mock = mockClient(S3Client)
    await removeResultsDirectory()
  })

  after(async () => {
    s3Mock.restore()
    await removeResultsDirectory()
  })

  it('should be able to put a file', async () => {
    const data = 'Hello world'
    const filePath = `${testResultsDirectory}/putObject/file-to-put.txt`
    const uploadPath = `${testResultsDirectory}/putObject/uploaded-file.txt`
    await ensureFileDirectoryExists(filePath)
    await ensureFileDirectoryExists(uploadPath)
    await writeFile(filePath, data, 'utf8')

    s3Mock.on(PutObjectCommand).callsFakeOnce((command) => {
      strictEqual(command.Key, 'uploaded-file.txt')
      strictEqual(command.Bucket, 'test-bucket')
      strictEqual(command.Body instanceof Readable, true)
      const stream = createWriteStream(uploadPath)
      command.Body.pipe(stream)
    })

    await putObject({
      bucket: 'test-bucket',
      key: 'uploaded-file.txt',
      sourcePath: filePath,
    })

    // fake sleep to wait for stream to finish
    await new Promise((resolve) => setTimeout(resolve, 0))

    const fileContent = await readFile(uploadPath, 'utf8')
    strictEqual(fileContent, data)
  })
})
