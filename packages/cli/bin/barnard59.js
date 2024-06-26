import { diag, DiagConsoleLogger, DiagLogLevel } from '@opentelemetry/api'
import { CollectorTraceExporter, CollectorMetricExporter } from '@opentelemetry/exporter-collector'
import { HttpInstrumentation } from '@opentelemetry/instrumentation-http'
import { WinstonInstrumentation } from '@opentelemetry/instrumentation-winston'
import { Resource, envDetector, processDetector } from '@opentelemetry/resources'
import { NodeSDK } from '@opentelemetry/sdk-node'
import { SemanticResourceAttributes } from '@opentelemetry/semantic-conventions'
import { BatchSpanProcessor } from '@opentelemetry/tracing'
import { Command } from 'commander'
import * as monitoringOptions from '../lib/cli/monitoringOptions.js'

const sdk = new NodeSDK({
  // Automatic detection is disabled, see comment below
  autoDetectResources: false,
  instrumentations: [
    new HttpInstrumentation(),
    new WinstonInstrumentation(),
  ],
  resource: new Resource({
    [SemanticResourceAttributes.SERVICE_NAME]: 'barnard59',
  }),
})

/**
 * @param {any} [err]
 */
const onError = async err => {
  // Remove signal handler to quit immediately when receiving multiple
  // SIGINT/SIGTEM
  process.off('SIGINT', onError)
  process.off('SIGTERM', onError)

  if (err) {
    if (err.skipTrace) {
      // eslint-disable-next-line no-console
      console.log(err.message)
    } else {
      // eslint-disable-next-line no-console
      console.error(err)
    }
  }
  await sdk.shutdown()
  process.exit(1)
}

(async () => {
  // Create a new commander instance that only parses the OTEL-related options.
  // This is needed because we want to keep the actual command definition in
  // the same file, but we need to figure out what exporter is being used
  // before starting the SDK and loading any other code.
  const program = new Command()

  program
    .addOption(monitoringOptions.enableBufferMonitor)
    .addOption(monitoringOptions.tracesExporter)
    .addOption(monitoringOptions.metricsExporter)
    .addOption(monitoringOptions.metricsInterval)
    .addOption(monitoringOptions.debug)

  // Command#parseOptions() does not handle --help or run anything, which fits
  // well for this use case. The options used here are then passed to the
  // actual commander instance to properly show up in --help.
  program.parseOptions(process.argv)

  const { otelTracesExporter, otelMetricsExporter, otelDebug, otelMetricsInterval } = program.opts()

  // Export the traces to a collector. By default it exports to
  // http://localhost:55681/v1/traces, but it can be changed with the
  // OTEL_EXPORTER_OTLP_TRACES_ENDPOINT environment variable.
  if (otelTracesExporter === 'otlp') {
    const exporter = new CollectorTraceExporter()
    const spanProcessor = new BatchSpanProcessor(exporter)
    sdk.configureTracerProvider({}, spanProcessor)
  }
  // Export the metrics to a collector. By default it exports to
  // http://localhost:55681/v1/metrics, but it can be changed with the
  // OTEL_EXPORTER_OTLP_METRICS_ENDPOINT environment variable.
  if (otelMetricsExporter === 'otlp') {
    const exporter = new CollectorMetricExporter()
    sdk.configureMeterProvider({
      exporter,
      interval: otelMetricsInterval,
    })
  }
  // @ts-ignore
  diag.setLogger(new DiagConsoleLogger(), DiagLogLevel[otelDebug])

  // Automatic resource detection is disabled because the default AWS and
  // GCP detectors are slow (add 500ms-2s to startup). Instead, we detect
  // the resources manually here, since we still want process informations
  // TODO: make this configurable if we're ever running in GCP/AWS environment?
  await sdk.detectResources({ detectors: [envDetector, processDetector] })

  await sdk.start()

  // Dynamically import the rest once the SDK started to ensure
  // monkey-patching was done properly
  const { default: cli } = await import('../lib/cli.js')
  const { run } = await cli()
  await run()
  await sdk.shutdown()
})().catch(onError)

process.on('uncaughtException', onError)
process.on('SIGINT', onError)
process.on('SIGTERM', onError)
