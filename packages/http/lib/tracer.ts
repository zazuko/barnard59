import { trace } from '@opentelemetry/api'

// TODO: set library version here
const tracer = trace.getTracer('barnard59-http')

export default tracer
