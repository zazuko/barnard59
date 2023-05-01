import { createWriteStream } from 'fs'
import { dirname, resolve } from 'path'
import { promisify } from 'util'
import { SpanStatusCode } from '@opentelemetry/api'
import program from 'commander'
import rdf from 'rdf-ext'
import fromFile from 'rdf-utils-fs/fromFile.js'
import { finished, PassThrough } from 'readable-stream'
import findPipeline from '../findPipeline.js'
import runner from '../runner.js'
import bufferDebug from './bufferDebug.js'
import tracer from './tracer.js'

async function fileToDataset(filename) {
  return rdf.dataset().import(fromFile(filename))
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

function setVariable(str, all) {
  let [key, value] = str.split('=', 2)

  if (typeof value === 'undefined') {
    value = process.env[key]
  }

  return all.set(key, value)
}

const runCommand = program
  .command('run <filename>')
  .option('--output [filename]', 'output file', '-')
  .option('--pipeline [iri]', 'IRI of the pipeline description')
  .option('--variable <name=value>', 'variable key value pairs', setVariable, new Map())
  .option('--variable-all', 'Import all environment variables')
  .option('-v, --verbose', 'enable diagnostic console output', (v, total) => ++total, 0)
  .option('--enable-buffer-monitor', 'enable histogram of buffer usage')
  .action(async (filename, { output, pipeline: iri, variable: variables, variableAll, verbose, enableBufferMonitor } = {}) => {
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
  })

async function run(commonOptions) {
  // Add the common options that were parsed earlier to properly have them
  // shown in --help
  for (const option of commonOptions) {
    runCommand.addOption(option)
  }

  await program.parseAsync(process.argv)
}

export { run }
