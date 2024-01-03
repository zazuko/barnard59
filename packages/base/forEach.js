import { promisify } from 'node:util'
import { context } from '@opentelemetry/api'
import stream from 'readable-stream'
import ReadableToReadable from 'readable-to-readable'

const { finished, Duplex } = stream

/**
 * @typedef {Pick<import('barnard59-core').Context, 'createPipeline' | 'variables'> & {
 *   pipeline: PipelineStream
 *   variable: string
 * }} ForEachOptions
 *
 * @typedef {import('stream').Duplex & {
 *  pipeline: import('barnard59-core').Pipeline
 * }} PipelineStream
 */

async function nextLoop() {
  return new Promise(resolve => setTimeout(resolve, 0))
}

class ForEach extends Duplex {
  /**
   * @param {ForEachOptions} context
   */
  constructor({ createPipeline, pipeline, variable, variables }) {
    super({ objectMode: true })

    // Bind the read and write function to the current context so the trace ID
    // gets properly propagated
    this._read = context.bind(context.active(), this._read)
    this._write = context.bind(context.active(), this._write)
    this.createPipeline = createPipeline

    // we only need the ptr of the pipeline to create new copies...
    this.ptr = pipeline.pipeline.ptr
    // ...so let's destroy it immediately
    pipeline.destroy()

    this.variable = variable
    this.variables = variables

    this.pull = null
  }

  /**
   * @type import('barnard59-core').Pipeline
   */
  get subPipeline() {
    // @ts-ignore
    return this.step.children[0]
  }

  set subPipeline(subPipeline) {
    // @ts-ignore
    this.step.children[0] = subPipeline
  }

  /**
   * @param {*} chunk
   * @param {string} encoding
   * @param {(error?: (Error | null)) => void} callback
   */
  async _write(chunk, encoding, callback) {
    // @ts-ignore
    try {
      const variables = new Map(this.variables)

      if (this.variable) {
        variables.set(this.variable, chunk)
      }

      this.subPipeline = this.createPipeline(this.ptr, { variables })

      // @ts-ignore
      this.pull = ReadableToReadable.readFrom(this.subPipeline.stream, { end: false })

      if (this.subPipeline.writable) {
        // @ts-ignore
        this.subPipeline.stream.end(chunk)
      }

      await promisify(finished)(this.subPipeline.stream)

      this.pull = null

      return callback()
    } catch (/** @type {any} */ cause) {
      const err = new Error(`error in forEach sub-pipeline ${this.ptr.value}`)

      err.stack += `\nCaused by: ${cause.stack}`

      return callback(err)
    }
  }

  async _read() {
    if (this._writableState.finished) {
      return this.push(null)
    }

    if (this.pull && !await this.pull()) {
      return
    }

    await nextLoop()

    this._read()
  }
}

/**
 * @this {import('barnard59-core').Context}
 * @param {PipelineStream} pipeline
 * @param {string} variable
 * @return {ForEach}
 */
function factory(pipeline, variable) {
  return new ForEach({
    pipeline,
    createPipeline: this.createPipeline,
    variable,
    variables: this.variables,
  })
}

export default factory
