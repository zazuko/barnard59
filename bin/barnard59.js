#!/usr/bin/env node

import { diag, DiagConsoleLogger } from '@opentelemetry/api'
import { CollectorTraceExporter } from '@opentelemetry/exporter-collector'
import { HttpInstrumentation } from '@opentelemetry/instrumentation-http'
import { WinstonInstrumentation } from '@opentelemetry/instrumentation-winston'
import { Resource } from '@opentelemetry/resources'
import { NodeSDK } from '@opentelemetry/sdk-node'
import { ResourceAttributes } from '@opentelemetry/semantic-conventions'
import { BatchSpanProcessor } from '@opentelemetry/tracing'

import program, { Option } from 'commander'

diag.setLogger(new DiagConsoleLogger())

const sdk = new NodeSDK({
  autoDetectResources: true,
  instrumentations: [
    new HttpInstrumentation(),
    new WinstonInstrumentation()
  ],
  resource: new Resource({
    [ResourceAttributes.SERVICE_NAME]: 'barnard59'
  })
})

function setVariable (str, all) {
  let [key, value] = str.split('=', 2)

  if (typeof value === 'undefined') {
    value = process.env[key]
  }

  return all.set(key, value)
}

program
  .command('run <filename>')
  .addOption(new Option('--otel-traces-exporter <exporter>', 'OpenTelemetry Traces exporter to use').choices(['otlp', 'none']).default('none'))
  .option('--output [filename]', 'output file', '-')
  .option('--pipeline [iri]', 'IRI of the pipeline description')
  .option('--variable <name=value>', 'variable key value pairs', setVariable, new Map())
  .option('--variable-all', 'Import all environment variables')
  .option('-v, --verbose', 'enable diagnostic console output', (v, total) => ++total, 0)
  .option('--enable-buffer-monitor', 'enable histogram of buffer usage')
  .action(async (filename, options) => {
    try {
      // Export the traces to a collector. By default it exports to
      // http://localhost:55681/v1/traces, but it can be changed with the
      // OTEL_EXPORTER_OTLP_TRACES_ENDPOINT environment variable.
      if (options.otelTracesExporter === 'otlp') {
        const exporter = new CollectorTraceExporter()
        const spanProcessor = new BatchSpanProcessor(exporter)
        sdk.configureTracerProvider({}, spanProcessor)
      }

      await sdk.start()

      // Dynamically import the rest once the SDK started to ensure
      // monkey-patching was done properly
      const { run } = await import('../cli.js')
      await run(filename, options)
    } finally {
      await sdk.shutdown()
    }
  })

program.parseAsync(process.argv).catch(err => {
  console.error(err)
  process.exit(1)
})

process.on('uncaughtException', async err => {
  console.error(err)
  await sdk.shutdown()
  process.exit(1)
})
