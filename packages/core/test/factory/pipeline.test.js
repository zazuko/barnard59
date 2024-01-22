import { strictEqual, throws } from 'node:assert'
import { expect } from 'chai'
import sinon from 'sinon'
import getStream from 'get-stream'
import { pipelineDefinitionLoader } from 'barnard59-test-support/loadPipelineDefinition.js'
import env from 'barnard59-env'
import createPipeline from '../../lib/factory/pipeline.js'
import { isReadable, isReadableObjectMode, isWritable, isWritableObjectMode } from '../../lib/isStream.js'
import Pipeline from '../../lib/Pipeline.js'

const loadPipelineDefinition = pipelineDefinitionLoader(import.meta.url, '../support/definitions')

describe('factory/pipeline', () => {
  it('should be a method', () => {
    strictEqual(typeof createPipeline, 'function')
  })

  it('should return a Pipeline object', async () => {
    const { ptr, basePath } = await loadPipelineDefinition('plain')

    const pipeline = createPipeline(ptr, { env, basePath })

    strictEqual(pipeline instanceof Pipeline, true)
  })

  it('should load the given pipeline from a plain graph pointer', async () => {
    const { ptr: definition, basePath } = await loadPipelineDefinition('plain')
    const ptr = { dataset: definition.dataset, term: definition.term }

    const pipeline = createPipeline(ptr, { env, basePath })
    await pipeline.init()

    strictEqual(pipeline.children.length, 2)
  })

  it('should throw an error if the term property of the graph pointer is missing', async () => {
    const { ptr: graph, basePath } = await loadPipelineDefinition('read')

    throws(() => {
      createPipeline(graph.any(), { env, basePath })
    })
  })

  it('should throw an error if the dataset property of the graph pointer is missing', async () => {
    const { ptr, basePath } = (await loadPipelineDefinition('read'))

    throws(() => {
      createPipeline({ term: ptr.term }, { env, basePath })
    })
  })

  it('should use the given basePath', async () => {
    const { ptr, basePath } = await loadPipelineDefinition('read')

    const pipeline = createPipeline(ptr, { env, basePath })

    strictEqual(pipeline.basePath, basePath)
  })

  it('should use the given context', async () => {
    const context = { abc: 'def', env }
    const { ptr, basePath } = await loadPipelineDefinition('read')

    const pipeline = createPipeline(ptr, { env, basePath, context })
    await getStream(pipeline.stream)

    strictEqual(pipeline.context.abc, context.abc)
  })

  it('should create a pipeline with readable interface matching the rdf:type', async () => {
    const { ptr, basePath } = await loadPipelineDefinition('read')

    const pipeline = createPipeline(ptr, { env, basePath })

    strictEqual(isReadable(pipeline.stream), true)
    strictEqual(!isReadableObjectMode(pipeline.stream), true)
  })

  it('should create a pipeline with readable object mode interface matching the rdf:type', async () => {
    const { ptr, basePath } = await loadPipelineDefinition('read-object-mode')

    const pipeline = createPipeline(ptr, { env, basePath })

    strictEqual(isReadableObjectMode(pipeline.stream), true)
  })

  it('should create a pipeline with writable interface matching the rdf:type', async () => {
    const { ptr, basePath } = await loadPipelineDefinition('write')

    const pipeline = createPipeline(ptr, { env, basePath })

    strictEqual(isWritable(pipeline.stream), true)
    strictEqual(!isWritableObjectMode(pipeline.stream), true)
  })

  it('should create a pipeline with writable object mode interface matching the rdf:type', async () => {
    const { ptr, basePath } = await loadPipelineDefinition('write-object-mode')

    const pipeline = createPipeline(ptr, { env, basePath })

    strictEqual(isWritableObjectMode(pipeline.stream), true)
  })

  it('should attach createPipeline to the context', async () => {
    const { ptr, basePath } = await loadPipelineDefinition('plain')

    const pipeline = createPipeline(ptr, { env, basePath })
    await pipeline.init()

    strictEqual(typeof pipeline.context.createPipeline, 'function')
  })

  it('should log variables', async () => {
    // given
    const { ptr, basePath } = await loadPipelineDefinition('nested')
    const logger = {
      debug: sinon.spy(),
      info: sinon.spy(),
      error: sinon.spy(),
      trace: sinon.spy(),
      verbose: sinon.spy(),
    }

    // when
    const pipeline = createPipeline(ptr, {
      env,
      basePath,
      logger,
      variables: new Map([['bar', 'secret'], ['baz', 'baz']]),
    })
    await pipeline.init()

    // then
    expect(logger.info).to.have.been.calledWith(sinon.match(/foo: foo/))
    expect(logger.info).to.have.been.calledWith(sinon.match(/bar: \*\*\*/))
    expect(logger.verbose).to.have.been.calledWith(sinon.match(/baz: baz/))
  })
})
