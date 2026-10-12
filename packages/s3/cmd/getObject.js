// @ts-check
import { createWriteStream } from 'node:fs'
import { PassThrough, Readable } from 'node:stream'
import { pipeline } from 'node:stream/promises'
import { GetObjectCommand } from '@aws-sdk/client-s3'
import { generateConfig, newClient } from '../lib/client.js'
import { ensureFileDirectoryExists } from '../lib/paths.js'

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
 * @returns {Promise<PassThrough>} Promise.
 */
const getObject = async ({
  bucket,
  key,
  destinationPath,
  accessKeyId,
  secretAccessKey,
  ...s3Config
}) => {
  await ensureFileDirectoryExists(destinationPath)

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

  await pipeline(
    Readable.fromWeb(/** @type {import('node:stream/web').ReadableStream} */ (data.Body.transformToWebStream())),
    createWriteStream(destinationPath),
  )

  return new PassThrough()
}

export default getObject
