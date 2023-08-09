import { dirname, resolve } from 'path'
import { promisify } from 'util'
import { createWriteStream } from 'fs'
import { finished, PassThrough } from 'readable-stream'
import { SpanStatusCode } from '@opentelemetry/api'
import fromStream from 'rdf-dataset-ext/fromStream.js'
import rdf from '@zazuko/env'
import fromFile from 'rdf-utils-fs/fromFile.js'
import program from 'commander'
import runner from '../../runner.js'
import findPipeline from '../../findPipeline.js'
import bufferDebug from './../bufferDebug.js'
import tracer from './../tracer.js'

async function fileToDataset(filename) {
  return fromStream(rdf.dataset(), fromFile(filename))
}

function createOutputStream(output) {
  if (output === '-') {
    // Use a PassThrough stream instead of just process.stdout to avoid closing
    // stdout too early
    const stream = new PassThrough()

    stream.pipe(process.stdout)

    return stream
  }

  return createWriteStream(output)
}

export default async function (filename, options = {}) {
  const { output, pipeline: iri, variable: variables, variableAll, verbose, enableBufferMonitor } = {
    ...program.opts(),
    ...options,
  }

  await tracer.startActiveSpan('barnard59 run', async span => {
    try {
      const level = ['error', 'info', 'debug'][verbose] || 'error'

      const dataset = await fileToDataset(filename)
      const ptr = findPipeline(dataset, iri)

      if (variableAll) {
        for (const [key, value] of Object.entries(process.env)) {
          variables.set(key, value)
        }
      }

      span.setAttribute('iri', ptr.value)

      const outputStream = createOutputStream(output)
      const { finished: runFinished, pipeline } = await runner(ptr, {
        basePath: resolve(dirname(filename)),
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
