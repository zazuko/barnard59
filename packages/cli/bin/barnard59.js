import { diag, DiagConsoleLogger, DiagLogLevel } from '@opentelemetry/api'
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http'
import { OTLPMetricExporter } from '@opentelemetry/exporter-metrics-otlp-http'
import { resourceFromAttributes } from '@opentelemetry/resources'
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node'
import { NodeSDK } from '@opentelemetry/sdk-node'
import { ATTR_SERVICE_NAME } from '@opentelemetry/semantic-conventions'
import { PeriodicExportingMetricReader } from '@opentelemetry/sdk-metrics'
import { Command } from 'commander'
import * as monitoringOptions from '../lib/cli/monitoringOptions.js'

/**
 * @type NodeSDK | undefined
 * @private
 */
let sdk

/**
 * @param {any} [err]
 */
const onError = async (err) => {
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
  try {
    await sdk?.shutdown()
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error('Error during SDK shutdown', e)
  }
  process.exit(1)
}

const run = async () => {
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

  /**
   * Configuration for the OpenTelemetry SDK.
   *
   * @type {Partial<import('@opentelemetry/sdk-node').NodeSDKConfiguration>}
   */
  const otelSdkConfig = {}

  // Export the traces to a collector. By default it exports to
  // http://localhost:4318/v1/traces, but it can be changed with the
  // OTEL_EXPORTER_OTLP_TRACES_ENDPOINT environment variable.
  if (otelTracesExporter === 'otlp') {
    otelSdkConfig.traceExporter = new OTLPTraceExporter()
  } else {
    process.env.OTEL_TRACES_EXPORTER = 'none'
  }

  // Export the metrics to a collector. By default it exports to
  // http://localhost:4318/v1/metrics, but it can be changed with the
  // OTEL_EXPORTER_OTLP_METRICS_ENDPOINT environment variable.
  if (otelMetricsExporter === 'otlp') {
    const exporter = new OTLPMetricExporter()
    const meterProvider = new PeriodicExportingMetricReader({
      exporter,
      exportIntervalMillis: otelMetricsInterval,
    })
    otelSdkConfig.metricReader = meterProvider
  } else {
    process.env.OTEL_METRICS_EXPORTER = 'none'
  }

  const diagLogLevel = /** @type {keyof typeof DiagLogLevel} */ (otelDebug || 'ERROR')
  diag.setLogger(new DiagConsoleLogger(), DiagLogLevel[diagLogLevel])

  sdk = new NodeSDK({
    ...otelSdkConfig,
    resource: resourceFromAttributes({
      [ATTR_SERVICE_NAME]: 'barnard59',
    }),
    instrumentations: [
      getNodeAutoInstrumentations(),
    ],
  })
  sdk.start()

  // Dynamically import the rest once the SDK started to ensure monkey-patching was done properly
  const { default: cli } = await import('../lib/cli.js')
  const { run } = await cli()
  await run()
  await sdk.shutdown()
}

run().catch(onError)

process.on('uncaughtException', onError)
process.on('SIGINT', onError)
process.on('SIGTERM', onError)
