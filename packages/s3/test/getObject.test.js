import { Readable } from 'stream'
import { readFile } from 'fs/promises'
import { strictEqual } from 'assert'
import { rimraf } from 'rimraf'
import { GetObjectCommand, S3Client } from '@aws-sdk/client-s3'
import { sdkStreamMixin } from '@aws-sdk/util-stream-node'
import { mockClient } from 'aws-sdk-client-mock'
import getObject from '../cmd/getObject.js'

const s3Mock = mockClient(S3Client)

const testResultsDirectory = './test/results'

const removeResultsDirectory = async () => {
  await rimraf(testResultsDirectory)
}

describe('getObject', () => {
  before(async () => {
    await removeResultsDirectory()
  })

  it('should be able to get a file', async () => {
    const data = 'Hello world'
    const filePath = `${testResultsDirectory}/test-result-getObject.txt`

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

  after(async () => {
    await removeResultsDirectory()
  })
})
