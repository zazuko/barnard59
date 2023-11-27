// @ts-check
import { PassThrough } from 'node:stream'
import { Upload } from '@aws-sdk/lib-storage'
import { PutObjectCommand } from '@aws-sdk/client-s3'
import { generateConfig, newClient } from '../lib/client.js'

/**
 * Create an empty object in a S3 bucket.
 * This makes sure the object exists before uploading to it.
 * This also makes sure the object is empty before uploading to it.
 *
 * @param {import('@aws-sdk/client-s3').S3Client} client S3 client.
 * @param {string} bucket S3 bucket.
 * @param {string} key S3 object key.
 * @returns {Promise<void>} Promise.
 */
const createEmptyObject = async (client, bucket, key) => {
  const input = {
    Bucket: bucket,
    Key: key,
    Body: '',
    ContentLength: 0,
  }
  const command = new PutObjectCommand(input)
  await client.send(command)
}

/**
 * Put an object from a Stream to a S3 bucket.
 *
 * @param {import('@aws-sdk/client-s3').S3ClientConfigType & {
 *  bucket: string;
 *  key: string;
 *  accessKeyId?: string;
 *  secretAccessKey?: string;
 * }} params Parameters.
 */
const putStreamObject = async ({
  bucket,
  key,
  accessKeyId,
  secretAccessKey,
  ...s3Config
}) => {
  const passThroughStream = new PassThrough()

  const client = newClient(generateConfig({ accessKeyId, secretAccessKey, ...s3Config }))

  // Make sure the object exists before uploading to it.
  await createEmptyObject(client, bucket, key)

  const parallelUploads3 = new Upload({
    client,
    params: {
      Bucket: bucket,
      Key: key,
      Body: passThroughStream,
    },
  })

  parallelUploads3.on('httpUploadProgress', (progress) => {
    // eslint-disable-next-line no-console
    console.log(progress)
  })

  // TODO: await this
  parallelUploads3.done()

  return passThroughStream
}

export default putStreamObject
