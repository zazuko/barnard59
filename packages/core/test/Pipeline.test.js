import { strictEqual, rejects } from 'node:assert'
import { promisify } from 'node:util'
import getStream from 'get-stream'
import stream from 'readable-stream'
import { pipelineDefinitionLoader } from 'barnard59-test-support/loadPipelineDefinition.js'
import env from 'barnard59-env'
import createPipeline from '../lib/factory/pipeline.js'
import { isStream } from '../lib/isStream.js'
import Pipeline from '../lib/Pipeline.js'
import eventToPromise from './support/eventToPromise.js'

const loadPipelineDefinition = pipelineDefinitionLoader(import.meta.url)

const finished = promisify(stream.finished)

describe('Pipeline', () => {
  it('should be a constructor', () => {
    strictEqual(typeof Pipeline, 'function')
  })

  it('should process the given pipeline definition', async () => {
    const { ptr, basePath } = await loadPipelineDefinition('read')

    const pipeline = createPipeline(ptr, { env, basePath })

    const result = await getStream(pipeline.stream)

    strictEqual(result, 'test')
  })

  it('should support writable pipelines', async () => {
    const { ptr, basePath } = await loadPipelineDefinition('write')

    const pipeline = createPipeline(ptr, { env, basePath })

    pipeline.stream.end('test')

    await finished(pipeline.stream)

    strictEqual(pipeline.context.variables.get('input').toString(), 'test')
  })

  it('should support nested pipelines', async () => {
    const { ptr, basePath } = await loadPipelineDefinition('nested')

    const pipeline = createPipeline(ptr, { env, basePath })

    const result = await getStream(pipeline.stream)

    strictEqual(result, 'test')
  })

  it('should emit error when nested pipeline step errors immediately', async () => {
    const { ptr, basePath } = await loadPipelineDefinition('nestedErrorBeforeInit')

    const pipeline = createPipeline(ptr, { env, basePath })

    await rejects(async () => {
      await getStream(pipeline.stream)
    })
  })

  it('should support nested writable pipelines', async () => {
    const { ptr, basePath } = await loadPipelineDefinition('nested-write')
    const result = []

    const pipeline = createPipeline(ptr, {
      env,
      basePath,
      context: { env, result },
    })

    await getStream(pipeline.stream)

    strictEqual(Buffer.concat(result).toString(), 'test')
  })

  it('should assign the pipeline stream to the .stream property', async () => {
    const { ptr, basePath } = await loadPipelineDefinition('nested')

    const pipeline = createPipeline(ptr, { env, basePath })

    strictEqual(isStream(pipeline.stream), true)
  })

  it('should assign the pipeline to the .pipeline property of the stream', async () => {
    const { ptr, basePath } = await loadPipelineDefinition('nested')

    const pipeline = createPipeline(ptr, { env, basePath })

    strictEqual(pipeline.stream.pipeline, pipeline)
  })

  it('should have a basePath string property', async () => {
    const { ptr, basePath } = await loadPipelineDefinition('read')

    const pipeline = createPipeline(ptr, { env, basePath })

    strictEqual(typeof pipeline.basePath, 'string')
  })

  it('should have a context object property', async () => {
    const { ptr, basePath } = await loadPipelineDefinition('read')

    const pipeline = createPipeline(ptr, { env, basePath })

    strictEqual(typeof pipeline.context, 'object')
  })

  it('should emit an error if the Pipeline contains no steps', async () => {
    const { ptr, basePath } = await loadPipelineDefinition('empty')

    const pipeline = createPipeline(ptr, { env, basePath })

    await rejects(async () => {
      await getStream(pipeline.stream)
    })
  })

  it('should have a ptr clownface property', async () => {
    const { ptr, basePath } = await loadPipelineDefinition('read')

    const pipeline = createPipeline(ptr, { env, basePath })

    strictEqual(typeof pipeline.ptr, 'object')
    strictEqual(typeof pipeline.ptr.any, 'function')
    strictEqual(typeof pipeline.ptr.term, 'object')
  })

  it('should have a ptr variables Map property', async () => {
    const { ptr, basePath } = await loadPipelineDefinition('read')

    const pipeline = createPipeline(ptr, { env, basePath })

    strictEqual(pipeline.variables instanceof Map, true)
  })

  it('should emit an error if an operation returns an invalid stream', async () => {
    const { ptr, basePath } = await loadPipelineDefinition('step-invalid')

    const pipeline = createPipeline(ptr, { env, basePath })

    await rejects(async () => {
      await getStream(pipeline.stream)
    })
  })

  it('should emit an error if an operation rejects with error', async () => {
    const { ptr, basePath } = await loadPipelineDefinition('step-operation-error')

    const pipeline = createPipeline(ptr, { env, basePath })

    await rejects(async () => {
      await getStream(pipeline.stream)
    })
  })

  it('should emit step stream errors', async () => {
    const { ptr, basePath } = await loadPipelineDefinition('step-stream-error')

    const pipeline = createPipeline(ptr, { env, basePath })

    await rejects(async () => {
      await getStream(pipeline.stream)
    })
  })

  it('should catch and emit step stream errors', async () => {
    const { ptr, basePath } = await loadPipelineDefinition('step-stream-throw')

    const pipeline = createPipeline(ptr, { env, basePath })

    await rejects(async () => {
      await getStream(pipeline.stream)
    })
  })

  describe('plain Pipeline', () => {
    it('should emit an end event', async () => {
      const { ptr, basePath } = await loadPipelineDefinition('plain')

      const pipeline = createPipeline(ptr, { env, basePath })

      const promise = eventToPromise(pipeline.stream, 'end')

      await getStream(pipeline.stream)

      await promise
    })
  })

  describe('readable Pipeline', () => {
    it('should emit an end event', async () => {
      const { ptr, basePath } = await loadPipelineDefinition('read')

      const pipeline = createPipeline(ptr, { env, basePath })

      const promise = eventToPromise(pipeline.stream, 'end')

      await getStream(pipeline.stream)

      await promise
    })

    it('should emit an error if the last step doesn\'t have a readable interface', async () => {
      const { ptr, basePath } = await loadPipelineDefinition('read-step-not-read')

      const pipeline = createPipeline(ptr, { env, basePath })

      await rejects(async () => {
        await getStream(pipeline.stream)
      })
    })
  })

  describe('writeable Pipeline', () => {
    it('should emit an finish event', async () => {
      const { ptr, basePath } = await loadPipelineDefinition('write')

      const pipeline = createPipeline(ptr, { env, basePath })

      const promise = eventToPromise(pipeline.stream, 'finish')

      pipeline.stream.end()

      await promise
    })
  })
})
