// @ts-check
import { PutObjectCommand } from '@aws-sdk/client-s3'
import { generateConfig, newClient } from '../lib/client.js'

/**
 * Put an object from a Stream to a S3 bucket.
 *
 * @param {import('@aws-sdk/client-s3').S3ClientConfigType & {
 *  stream: import('node:stream').Readable;
 *  bucket: string;
 *  key: string;
 *  accessKeyId?: string;
 *  secretAccessKey?: string;
 * }} params Parameters.
 */
const putStreamObject = async ({
  stream,
  bucket,
  key,
  accessKeyId,
  secretAccessKey,
  ...s3Config
}) => {
  const client = newClient(generateConfig({ accessKeyId, secretAccessKey, ...s3Config }))

  const input = {
    Bucket: bucket,
    Key: key,
    Body: stream,
  }
  const command = new PutObjectCommand(input)
  await client.send(command)
}

export default putStreamObject
