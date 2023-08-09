import { promisify } from 'util'
import { createWriteStream } from 'fs'
import { finished, PassThrough } from 'readable-stream'
import { SpanStatusCode } from '@opentelemetry/api'
import { program } from 'commander'
import runner from '../../runner.js'
import bufferDebug from './../bufferDebug.js'
import tracer from './../tracer.js'

function createOutputStream(output = '-') {
  if (output === '-') {
    // Use a PassThrough stream instead of just process.stdout to avoid closing
    // stdout too early
    const stream = new PassThrough()

    stream.pipe(process.stdout)

    return stream
  }

  return createWriteStream(output)
}

export default async function (ptr, basePath, options = {}) {
  const programOpts = program.opts()
  const { output, variableAll, enableBufferMonitor } = {
    ...program.opts(),
    ...options,
  }
  const variables = new Map([
    ...programOpts.variable.entries(),
    ...options.variable.entries(),
  ])
  const verbose = Math.max(programOpts.verbose, options.verbose)

  await tracer.startActiveSpan('barnard59 run', async span => {
    try {
      const level = ['error', 'info', 'debug'][verbose] || 'error'

      if (variableAll) {
        for (const [key, value] of Object.entries(process.env)) {
          variables.set(key, value)
        }
      }

      span.setAttribute('iri', ptr.value)

      const outputStream = createOutputStream(output)
      const { finished: runFinished, pipeline } = await runner(ptr, {
        basePath,
        level,
        outputStream,
        variables,
      })

      if (enableBufferMonitor) {
        bufferDebug(pipeline)
      }

      await runFinished
      // TODO: this has some issues
      await promisify(finished)(outputStream)
    } catch (err) {
      span.recordException(err)
      span.setStatus({ code: SpanStatusCode.ERROR, message: err.message })
      throw err
    } finally {
      span.end()
    }
  })
}
