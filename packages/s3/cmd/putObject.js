// @ts-check
import { createReadStream } from 'node:fs'
import { PassThrough } from 'node:stream'
import { PutObjectCommand } from '@aws-sdk/client-s3'
import { generateConfig, newClient } from '../lib/client.js'

/**
 * Put an object to a S3 bucket.
 *
 * @param {import('@aws-sdk/client-s3').S3ClientConfigType & {
 *  bucket: string;
 *  key: string;
 *  sourcePath: string;
 *  accessKeyId?: string;
 *  secretAccessKey?: string;
 * }} params Parameters.
 * @returns {Promise<PassThrough>} Promise.
 */
const putObject = async ({
  bucket,
  key,
  sourcePath,
  accessKeyId,
  secretAccessKey,
  ...s3Config
}) => {
  const client = newClient(generateConfig({ accessKeyId, secretAccessKey, ...s3Config }))
  const stream = createReadStream(sourcePath)

  const input = {
    Bucket: bucket,
    Key: key,
    Body: stream,
  }
  const command = new PutObjectCommand(input)
  await client.send(command)

  return new PassThrough()
}

export default putObject
