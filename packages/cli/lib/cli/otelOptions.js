import { Option } from 'commander'
import { DiagLogLevel } from '@opentelemetry/api'

export const tracesExporter = new Option('--otel-traces-exporter <exporter>', 'OpenTelemetry Traces exporter to use')
  .choices(['otlp', 'none'])
  .default('none')

export const metricsExporter = new Option('--otel-metrics-exporter <exporter>', 'OpenTelemetry Metrics exporter to use')
  .choices(['otlp', 'none'])
  .default('none')

export const metricsInterval = new Option('--otel-metrics-interval <milliseconds>', 'Export Metrics interval')
  .argParser(value => Number.parseInt(value, 10))
  .default(10000)

export const debug = new Option('--otel-debug <level>', 'Enable OpenTelemetry console diagnostic output')
  .choices([...Object.keys(DiagLogLevel)].filter(opt => isNaN(Number.parseInt(opt, 10))))
  .default('ERROR')
