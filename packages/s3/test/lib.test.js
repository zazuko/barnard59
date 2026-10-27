// @ts-check
import { strictEqual, deepEqual } from 'node:assert'
import { S3Client } from '@aws-sdk/client-s3'
import { generateConfig, newClient } from '../lib/client.js'

describe('lib', function () {
  describe('client', function () {
    it('should be able to create a new client', async function () {
      const client = new S3Client()
      strictEqual(client instanceof S3Client, true)
    })

    it('should be able to create a new client using newClient', async function () {
      const client = newClient({})
      strictEqual(client instanceof S3Client, true)
    })

    it('should be able to generate a config with default values', async function () {
      const generatedConfig = generateConfig({})
      deepEqual(generatedConfig, {
        region: 'us-east-1',
      })
    })

    it('should be able to override default region', async function () {
      const generatedConfig = generateConfig({
        region: 'eu-central-1',
      })
      deepEqual(generatedConfig, {
        region: 'eu-central-1',
      })
    })

    it('should be able to forward authentication', async function () {
      const generatedConfig = generateConfig({
        endpoint: 'http://localhost',
        accessKeyId: 'accessKeyId',
        secretAccessKey: 'secretAccessKey',
        region: 'eu-central-1',
      })
      deepEqual(generatedConfig, {
        endpoint: 'http://localhost',
        credentials: {
          accessKeyId: 'accessKeyId',
          secretAccessKey: 'secretAccessKey',
        },
        region: 'eu-central-1',
      })
    })
  })
})
