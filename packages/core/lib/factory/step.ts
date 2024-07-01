import { Duplex } from 'node:stream'
import type { Stream } from 'readable-stream'
import { SpanStatusCode } from '@opentelemetry/api'
import type { GraphPointer } from 'clownface'
import type { Logger } from 'winston'
import type { LoaderRegistry } from 'rdf-loaders-registry'
import { isStream } from '../isStream.js'
import PipelineError from '../PipelineError.js'
import Step from '../Step.js'
import tracer from '../tracer.js'
import type { Context, VariableMap } from '../../index.js'
import createArguments from './arguments.js'
import createOperation from './operation.js'

async function createStep(ptr: GraphPointer, { basePath, context, loaderRegistry, logger, variables }: { basePath: string; context: Context; loaderRegistry: LoaderRegistry; logger: Logger; variables: VariableMap }) {
  return tracer.startActiveSpan('createStep', { attributes: { iri: ptr.value } }, async span => {
    try {
      const args = await createArguments(ptr, { basePath, context, loaderRegistry, logger, variables })
      const operation = await createOperation(ptr.out(context.env.ns.code.implementedBy), { basePath, context, loaderRegistry, logger, variables })
      let stream: Stream
      const streamOrGenerator = await operation.apply(context, args)

      if (typeof streamOrGenerator === 'function') {
        stream = <Stream><unknown>Duplex.from(streamOrGenerator)
      } else {
        stream = streamOrGenerator
      }

      if (!stream || !isStream(stream)) {
        throw new Error(`${ptr.value} didn't return a stream`)
      }

      return new Step({ args, basePath, context, loaderRegistry, logger, operation, ptr, stream, variables })
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (cause: any) {
      span.recordException(cause)
      span.setStatus({ code: SpanStatusCode.ERROR, message: cause.message })
      throw new PipelineError(`could not load step ${ptr.value}`, cause)
    } finally {
      span.end()
    }
  })
}

export default createStep
