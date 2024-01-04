import { promisify } from 'util'
import { createWriteStream } from 'fs'
import { finished, PassThrough } from 'readable-stream'
import { SpanStatusCode } from '@opentelemetry/api'
import env from 'barnard59-env'
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

/**
 * @param {import('clownface').AnyPointer} ptr
 * @param {string} basePath
 * @param {Partial<import('../cli.js').CliOptions>} [options]
 */
export default async function (ptr, basePath, options = {}) {
  await tracer.startActiveSpan('barnard59 run', async span => {
    try {
      const { output, variables, enableBufferMonitor, logger, level, quiet } = options

      if (ptr.value) {
        span.setAttribute('iri', ptr.value)
      }

      const outputStream = createOutputStream(output)
      const { finished: runFinished, pipeline } = await runner(ptr, env, {
        basePath,
        level,
        quiet,
        logger,
        outputStream,
        variables,
      })

      if (enableBufferMonitor) {
        bufferDebug(pipeline)
      }

      await runFinished
      // TODO: this has some issues
      await promisify(finished)(outputStream)
    } catch (/** @type any */ err) {
      span.recordException(err)
      span.setStatus({ code: SpanStatusCode.ERROR, message: err.message })
      throw err
    } finally {
      span.end()
    }
  })
}
