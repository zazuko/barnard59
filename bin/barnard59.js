#!/usr/bin/env node

import { createWriteStream } from 'fs'
import { dirname, resolve } from 'path'
import program from 'commander'
import rdf from 'rdf-ext'
import fromFile from 'rdf-utils-fs/fromFile.js'
import bufferDebug from '../lib/bufferDebug.js'
import findPipeline from '../findPipeline.js'
import runner from '../runner.js'

async function fileToDataset (filename) {
  return rdf.dataset().import(fromFile(filename))
}

function createOutputStream (output) {
  if (output === '-') {
    return process.stdout
  }

  return createWriteStream(output)
}

function setVariable (str, all) {
  let [key, value] = str.split('=', 2)

  if (typeof value === 'undefined') {
    value = process.env[key]
  }

  return all.set(key, value)
}

program
  .command('run <filename>')
  .option('--output [filename]', 'output file', '-')
  .option('--pipeline [iri]', 'IRI of the pipeline description')
  .option('--variable <name=value>', 'variable key value pairs', setVariable, new Map())
  .option('--variable-all', 'Import all environment variables')
  .option('-v, --verbose', 'enable diagnostic console output', (v, total) => ++total, 0)
  .option('--enable-buffer-monitor', 'enable histogram of buffer usage')
  .action(async (filename, { output, pipeline: iri, variable: variables, variableAll, verbose, enableBufferMonitor } = {}) => {
    try {
      const level = ['error', 'info', 'debug'][verbose] || 'error'

      const dataset = await fileToDataset(filename)
      const ptr = findPipeline(dataset, iri)

      if (variableAll) {
        for (const [key, value] of Object.entries(process.env)) {
          variables.set(key, value)
        }
      }

      const { finished, pipeline } = await runner(ptr, {
        basePath: resolve(dirname(filename)),
        level,
        outputStream: createOutputStream(output),
        variables
      })

      if (enableBufferMonitor) {
        bufferDebug(pipeline)
      }

      await finished
    } catch (err) {
      console.error(err)
      process.exit(1)
    }
  })

program.parse(process.argv)
