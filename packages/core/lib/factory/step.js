import { SpanStatusCode } from '@opentelemetry/api'
import { isStream } from '../isStream.js'
import ns from '../namespaces.js'
import PipelineError from '../PipelineError.js'
import Step from '../Step.js'
import tracer from '../tracer.js'
import createArguments from './arguments.js'
import createOperation from './operation.js'

function createStep (ptr, { basePath, context, loaderRegistry, logger, variables }) {
  return tracer.startActiveSpan('createStep', { attributes: { iri: ptr.value } }, async span => {
    try {
      const args = await createArguments(ptr, { basePath, context, loaderRegistry, logger, variables })
      const operation = await createOperation(ptr.out(ns.code.implementedBy), { basePath, context, loaderRegistry, logger, variables })
      const stream = await operation.apply(context, args)

      if (!stream || !isStream(stream)) {
        throw new Error(`${ptr.value} didn't return a stream`)
      }

      return new Step({ args, basePath, context, loaderRegistry, logger, operation, ptr, stream, variables })
    } catch (cause) {
      span.recordException(cause)
      span.setStatus({ code: SpanStatusCode.ERROR, message: cause.message })
      throw new PipelineError(`could not load step ${ptr.value}`, cause)
    } finally {
      span.end()
    }
  })
}

export default createStep
