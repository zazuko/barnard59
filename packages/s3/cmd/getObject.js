// @ts-check
import { GetObjectCommand } from '@aws-sdk/client-s3'
import { generateConfig, newClient } from '../lib/client.js'
import { createWritableStream } from '../lib/streams.js'

/**
 * Get an object from a S3 bucket.
 *
 * @param {import('@aws-sdk/client-s3').S3ClientConfigType & {
 *  bucket: string;
 *  key: string;
 *  destinationPath: string;
 *  accessKeyId?: string;
 *  secretAccessKey?: string;
 * }} params Parameters.
 */
const getObject = async ({
  bucket,
  key,
  destinationPath,
  accessKeyId,
  secretAccessKey,
  ...s3Config
}) => {
  const client = newClient(generateConfig({ accessKeyId, secretAccessKey, ...s3Config }))
  const input = {
    Bucket: bucket,
    Key: key,
  }
  const command = new GetObjectCommand(input)
  const data = await client.send(command)

  const objectBody = data.Body
  if (!objectBody) {
    throw new Error('No body')
  }

  const stream = objectBody.transformToWebStream()
  const writeStream = createWritableStream(destinationPath)
  stream.pipeTo(writeStream)
}

export default getObject
