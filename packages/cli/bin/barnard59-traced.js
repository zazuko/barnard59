#!/usr/bin/env node

import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node'
import { CollectorTraceExporter, CollectorMetricExporter } from '@opentelemetry/exporter-collector'
import { Resource } from '@opentelemetry/resources'
import { NodeSDK } from '@opentelemetry/sdk-node'
import { ResourceAttributes } from '@opentelemetry/semantic-conventions'

const traceExporter = new CollectorTraceExporter()
const metricExporter = new CollectorMetricExporter()

const sdk = new NodeSDK({
  autoDetectResources: true,
  traceExporter,
  metricExporter,
  instrumentations: [getNodeAutoInstrumentations()],
  resource: new Resource({
    [ResourceAttributes.SERVICE_NAME]: 'barnard59'
  })
})

sdk.start()
  .then(() => import('../cli.js'))
  .then(({ main }) => main())
  .finally(() => sdk.shutdown())
  .catch(err => {
    console.error(err)
    process.exit(1)
  })
  .then(() => sdk.shutdown())

process.on('uncaughtException', async (err) => {
  console.error(err)
  await sdk.shutdown()
  process.exit(1)
});
