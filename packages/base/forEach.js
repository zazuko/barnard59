import { promisify } from 'util'
import { context } from '@opentelemetry/api'
import stream from 'readable-stream'
import ReadableToReadable from 'readable-to-readable'

const { finished, Duplex } = stream

async function nextLoop () {
  return new Promise(resolve => setTimeout(resolve, 0))
}

class ForEach extends Duplex {
  constructor ({ createPipeline, pipeline, step, variable, variables }) {
    super({ objectMode: true })

    // Bind the read and write function to the current context so the trace ID
    // gets properly propagated
    this._read = context.bind(context.active(), this._read)
    this._write = context.bind(context.active(), this._write)
    this.createPipeline = createPipeline
    this.step = step

    // we only need the ptr of the pipeline to create new copies...
    this.ptr = pipeline.pipeline.ptr
    // ...so let's destroy it immediately
    pipeline.destroy()

    this.variable = variable
    this.variables = variables

    this.pull = null
  }

  get subPipeline () {
    return this.step.children[0]
  }

  set subPipeline (subPipeline) {
    this.step.children[0] = subPipeline
  }

  async _write (chunk, encoding, callback) {
    try {
      const variables = new Map(this.variables)

      if (this.variable) {
        variables.set(this.variable, chunk)
      }

      this.subPipeline = this.createPipeline(this.ptr, { variables })

      this.pull = ReadableToReadable.readFrom(this.subPipeline.stream, { end: false })

      if (this.subPipeline.writable) {
        this.subPipeline.stream.end(chunk)
      }

      await promisify(finished)(this.subPipeline.stream)

      this.pull = null

      return callback()
    } catch (cause) {
      const err = new Error(`error in forEach sub-pipeline ${this.ptr.value}`)

      err.stack += `\nCaused by: ${cause.stack}`

      return callback(err)
    }
  }

  async _read () {
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

function factory (pipeline, variable) {
  return new ForEach({
    pipeline,
    createPipeline: this.createPipeline,
    step: this.step,
    variable,
    variables: this.variables
  })
}

export default factory
