import { Readable } from 'stream'
import { createWriteStream } from 'fs'
import { readFile, writeFile } from 'fs/promises'
import { strictEqual } from 'assert'
import { rimraf } from 'rimraf'
import { GetObjectCommand, PutObjectCommand, S3Client } from '@aws-sdk/client-s3'
import { sdkStreamMixin } from '@aws-sdk/util-stream-node'
import { mockClient } from 'aws-sdk-client-mock'
import getObject from '../cmd/getObject.js'
import putObject from '../cmd/putObject.js'
import { ensureFileDirectoryExists } from '../lib/paths.js'

const s3Mock = mockClient(S3Client)

const testResultsDirectory = './test/results'

const removeResultsDirectory = async () => {
  await rimraf(testResultsDirectory)
}

describe('barnard59-s3', async () => {
  before(async () => {
    await removeResultsDirectory()
  })

  describe('getObject', async () => {
    it('should be able to get a file', async () => {
      const data = 'Hello world'
      const filePath = `${testResultsDirectory}/getObject/get-a-file.txt`

      // create Stream from string
      const stream = new Readable()
      stream.push(data)
      stream.push(null) // end of stream

      const sdkStream = sdkStreamMixin(stream)

      s3Mock.on(GetObjectCommand).resolves({ Body: sdkStream })

      await getObject({
        destinationPath: filePath,
      })

      const fileContent = await readFile(filePath, 'utf8')
      strictEqual(fileContent, data)
    })
  })

  describe('putObject', async () => {
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

  after(async () => {
    s3Mock.restore()
    await removeResultsDirectory()
  })
})
