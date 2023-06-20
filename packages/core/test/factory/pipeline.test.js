import { strictEqual, throws } from 'assert'
import { resolve } from 'path'
import { expect } from 'chai'
import sinon from 'sinon'
import getStream from 'get-stream'
import { describe, it } from 'mocha'
import createPipeline from '../../lib/factory/pipeline.js'
import { isReadable, isReadableObjectMode, isWritable, isWritableObjectMode } from '../../lib/isStream.js'
import Pipeline from '../../lib/Pipeline.js'
import loadPipelineDefinition from '../support/loadPipelineDefinition.js'

describe('factory/pipeline', () => {
  it('should be a method', () => {
    strictEqual(typeof createPipeline, 'function')
  })

  it('should return a Pipeline object', async () => {
    const definition = await loadPipelineDefinition('plain')

    const pipeline = createPipeline(definition, { basePath: resolve('test') })

    strictEqual(pipeline instanceof Pipeline, true)
  })

  it('should load the given pipeline from a plain graph pointer', async () => {
    const definition = await loadPipelineDefinition('plain')
    const ptr = { dataset: definition.dataset, term: definition.term }

    const pipeline = createPipeline(ptr, { basePath: resolve('test') })
    await pipeline.init()

    strictEqual(pipeline.children.length, 2)
  })

  it('should throw an error if the term property of the graph pointer is missing', async () => {
    const ptr = (await loadPipelineDefinition('read')).any()

    throws(() => {
      createPipeline(ptr, { basePath: resolve('test') })
    })
  })

  it('should throw an error if the dataset property of the graph pointer is missing', async () => {
    const ptr = (await loadPipelineDefinition('read'))

    throws(() => {
      createPipeline({ term: ptr.term }, { basePath: resolve('test') })
    })
  })

  it('should use the given basePath', async () => {
    const basePath = resolve('test')
    const ptr = await loadPipelineDefinition('read')

    const pipeline = createPipeline(ptr, { basePath })

    strictEqual(pipeline.basePath, basePath)
  })

  it('should use the given context', async () => {
    const context = { abc: 'def' }
    const ptr = await loadPipelineDefinition('read')

    const pipeline = createPipeline(ptr, { basePath: resolve('test'), context })
    await getStream(pipeline.stream)

    strictEqual(pipeline.context.abc, context.abc)
  })

  it('should create a pipeline with readable interface matching the rdf:type', async () => {
    const ptr = await loadPipelineDefinition('read')

    const pipeline = createPipeline(ptr, { basePath: resolve('test') })

    strictEqual(isReadable(pipeline.stream), true)
    strictEqual(!isReadableObjectMode(pipeline.stream), true)
  })

  it('should create a pipeline with readable object mode interface matching the rdf:type', async () => {
    const ptr = await loadPipelineDefinition('read-object-mode')

    const pipeline = createPipeline(ptr, { basePath: resolve('test') })

    strictEqual(isReadableObjectMode(pipeline.stream), true)
  })

  it('should create a pipeline with writable interface matching the rdf:type', async () => {
    const ptr = await loadPipelineDefinition('write')

    const pipeline = createPipeline(ptr, { basePath: resolve('test') })

    strictEqual(isWritable(pipeline.stream), true)
    strictEqual(!isWritableObjectMode(pipeline.stream), true)
  })

  it('should create a pipeline with writable object mode interface matching the rdf:type', async () => {
    const ptr = await loadPipelineDefinition('write-object-mode')

    const pipeline = createPipeline(ptr, { basePath: resolve('test') })

    strictEqual(isWritableObjectMode(pipeline.stream), true)
  })

  it('should attach createPipeline to the context', async () => {
    const definition = await loadPipelineDefinition('plain')

    const pipeline = createPipeline(definition, { basePath: resolve('test') })
    await pipeline.init()

    strictEqual(typeof pipeline.context.createPipeline, 'function')
  })

  it('should log variables', async () => {
    // given
    const definition = await loadPipelineDefinition('nested')
    const logger = {
      debug: sinon.spy(),
      info: sinon.spy(),
    }

    // when
    const pipeline = createPipeline(definition, {
      basePath: resolve('test'),
      logger,
      variables: new Map([['bar', 'secret'], ['baz', 'baz']]),
    })
    await pipeline.init()

    // then
    expect(logger.info).to.have.been.calledWith(sinon.match(/foo: foo/))
    expect(logger.info).to.have.been.calledWith(sinon.match(/bar: \*\*\*/))
    expect(logger.debug).to.have.been.calledWith(sinon.match(/baz: baz/))
  })
})
