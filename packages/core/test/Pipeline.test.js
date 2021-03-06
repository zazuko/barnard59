import { strictEqual, rejects } from 'assert'
import { resolve } from 'path'
import { promisify } from 'util'
import getStream from 'get-stream'
import { describe, it } from 'mocha'
import stream from 'readable-stream'
import { isStream } from '../lib/isStream.js'
import Pipeline from '../lib/Pipeline.js'
import createPipeline from '../lib/factory/pipeline.js'
import eventToPromise from './support/eventToPromise.js'
import loadPipelineDefinition from './support/loadPipelineDefinition.js'

const finished = promisify(stream.finished)

describe('Pipeline', () => {
  it('should be a constructor', () => {
    strictEqual(typeof Pipeline, 'function')
  })

  it('should process the given pipeline definition', async () => {
    const ptr = await loadPipelineDefinition('read')

    const pipeline = createPipeline(ptr, { basePath: resolve('test') })

    const result = await getStream(pipeline.stream)

    strictEqual(result, 'test')
  })

  it('should support writable pipelines', async () => {
    const ptr = await loadPipelineDefinition('write')

    const pipeline = createPipeline(ptr, { basePath: resolve('test') })

    pipeline.stream.end('test')

    await finished(pipeline.stream)

    strictEqual(pipeline.context.content.toString(), 'test')
  })

  it('should support nested pipelines', async () => {
    const ptr = await loadPipelineDefinition('nested')

    const pipeline = createPipeline(ptr, { basePath: resolve('test') })

    const result = await getStream(pipeline.stream)

    strictEqual(result, 'test')
  })

  it('should assign the pipeline stream to the .stream property', async () => {
    const ptr = await loadPipelineDefinition('nested')

    const pipeline = createPipeline(ptr, { basePath: resolve('test') })

    strictEqual(isStream(pipeline.stream), true)
  })

  it('should assign the pipeline to the .pipeline property of the stream', async () => {
    const ptr = await loadPipelineDefinition('nested')

    const pipeline = createPipeline(ptr, { basePath: resolve('test') })

    strictEqual(pipeline.stream.pipeline, pipeline)
  })

  it('should have a basePath string property', async () => {
    const ptr = await loadPipelineDefinition('read')

    const pipeline = createPipeline(ptr, { basePath: resolve('test') })

    strictEqual(typeof pipeline.basePath, 'string')
  })

  it('should have a context object property', async () => {
    const ptr = await loadPipelineDefinition('read')

    const pipeline = createPipeline(ptr, { basePath: resolve('test') })

    strictEqual(typeof pipeline.context, 'object')
  })

  it('should emit an error if the Pipeline contains no steps', async () => {
    const ptr = await loadPipelineDefinition('empty')

    const pipeline = createPipeline(ptr, { basePath: resolve('test') })

    await rejects(async () => {
      await getStream(pipeline.stream)
    })
  })

  it('should have a ptr clownface property', async () => {
    const ptr = await loadPipelineDefinition('read')

    const pipeline = createPipeline(ptr, { basePath: resolve('test') })

    strictEqual(typeof pipeline.ptr, 'object')
    strictEqual(typeof pipeline.ptr.any, 'function')
    strictEqual(typeof pipeline.ptr.term, 'object')
  })

  it('should have a ptr variables Map property', async () => {
    const ptr = await loadPipelineDefinition('read')

    const pipeline = createPipeline(ptr, { basePath: resolve('test') })

    strictEqual(pipeline.variables instanceof Map, true)
  })

  it('should emit an error if an operation returns an invalid stream', async () => {
    const ptr = await loadPipelineDefinition('step-invalid')

    const pipeline = createPipeline(ptr, { basePath: resolve('test') })

    await rejects(async () => {
      await getStream(pipeline.stream)
    })
  })

  it('should emit an error if an operation rejects with error', async () => {
    const ptr = await loadPipelineDefinition('step-operation-error')

    const pipeline = createPipeline(ptr, { basePath: resolve('test') })

    await rejects(async () => {
      await getStream(pipeline.stream)
    })
  })

  it('should emit step stream errors', async () => {
    const ptr = await loadPipelineDefinition('step-stream-error')

    const pipeline = createPipeline(ptr, { basePath: resolve('test') })

    await rejects(async () => {
      await getStream(pipeline.stream)
    })
  })

  it('should catch and emit step stream errors', async () => {
    const ptr = await loadPipelineDefinition('step-stream-throw')

    const pipeline = createPipeline(ptr, { basePath: resolve('test') })

    await rejects(async () => {
      await getStream(pipeline.stream)
    })
  })

  describe('plain Pipeline', () => {
    it('should emit an end event', async () => {
      const ptr = await loadPipelineDefinition('plain')

      const pipeline = createPipeline(ptr, { basePath: resolve('test') })

      const promise = eventToPromise(pipeline.stream, 'end')

      await getStream(pipeline.stream)

      await promise
    })
  })

  describe('readable Pipeline', () => {
    it('should emit an end event', async () => {
      const ptr = await loadPipelineDefinition('read')

      const pipeline = createPipeline(ptr, { basePath: resolve('test') })

      const promise = eventToPromise(pipeline.stream, 'end')

      await getStream(pipeline.stream)

      await promise
    })
  })

  describe('writeable Pipeline', () => {
    it('should emit an finish event', async () => {
      const ptr = await loadPipelineDefinition('write')

      const pipeline = createPipeline(ptr, { basePath: resolve('test') })

      const promise = eventToPromise(pipeline.stream, 'finish')

      pipeline.stream.end()

      await promise
    })
  })
})
