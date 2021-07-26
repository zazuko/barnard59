import { trace } from '@opentelemetry/api'

const tracer = trace.getTracer('barnard59-base')
export default tracer
