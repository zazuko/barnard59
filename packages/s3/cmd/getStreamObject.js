// @ts-check
import { GetObjectCommand } from '@aws-sdk/client-s3'
import { generateConfig, newClient } from '../lib/client.js'
import { toReadable } from '../lib/streams.js'

/**
 * Get an object from a S3 bucket as a Stream.
 *
 * @param {import('@aws-sdk/client-s3').S3ClientConfigType & {
 *  bucket: string;
 *  key: string;
 *  accessKeyId?: string;
 *  secretAccessKey?: string;
 * }} params Parameters.
 * @returns {Promise<import('node:stream').Readable>} S3 object as stream.
 */
const getStreamObject = async ({
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
  }
  const command = new GetObjectCommand(input)
  const data = await client.send(command)

  if (!data || !data.Body) {
    throw new Error('There was an issue while fetching the requested S3 object.')
  }

  const stream = data.Body.transformToWebStream()
  return toReadable(stream)
}

export default getStreamObject
