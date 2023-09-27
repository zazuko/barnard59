// @ts-check
import { S3Client } from '@aws-sdk/client-s3'

/**
 * Create a new S3 client.
 *
 * @param {import('@aws-sdk/client-s3').S3ClientConfigType} config S3 client configuration object.
 * @returns {import('@aws-sdk/client-s3').S3Client} S3 client.
 */
export const newClient = (config) => {
  const client = new S3Client(config)
  return client
}

/**
 * Generate a S3 client configuration object.
 *
 * @param {import('@aws-sdk/client-s3').S3ClientConfigType & {
 *  accessKeyId?: string;
 *  secretAccessKey?: string;
 * }} params Parameters.
 * @returns {import('@aws-sdk/client-s3').S3ClientConfigType} S3 client configuration object.
 */
export const generateConfig = ({ accessKeyId, secretAccessKey, ...s3Config }) => {
  const config = { ...s3Config }

  // set credentials if provided
  if (accessKeyId && secretAccessKey) {
    config.credentials = {
      accessKeyId,
      secretAccessKey,
    }
  }

  // set a default region if none is provided
  if (!s3Config.region) {
    config.region = 'us-east-1'
  }

  return config
}
