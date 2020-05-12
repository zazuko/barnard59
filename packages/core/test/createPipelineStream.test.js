const { rejects, strictEqual } = require('assert')
const path = require('path')
const clownface = require('clownface')
const Clownface = require('clownface/lib/Clownface')
const { describe, it } = require('mocha')
const isStream = require('isstream')
const rdf = require('rdf-ext')
const createLoaderRegistry = require('../lib/createLoaderRegistry')
const createPipelineStream = require('../lib/createPipelineStream')
const eventToPromise = require('../lib/eventToPromise')
const Pipeline = require('../lib/Pipeline')
const load = require('./support/load-pipeline')
const run = require('./support/run')

const pipelineTerm = rdf.namedNode('http://example.org/pipeline/')

describe('createPipelineStream', () => {
  it('should return a stream', async () => {
    // given
    const definition = await load('write.ttl')
    const node = clownface(definition, pipelineTerm)

    // when
    const stream = createPipelineStream(node)

    // then
    strictEqual(isStream(stream), true)
  })

  it('should handle stream errors', async () => {
    // given
    const definition = await load('stream-error.ttl')
    const node = clownface(definition, pipelineTerm)
    const stream = createPipelineStream(node, {
      basePath: path.resolve('test'),
      loaderRegistry: createLoaderRegistry()
    })

    // when
    const promise = run(stream)

    // then
    await rejects(promise)
  })

  it('should assign the inner pipeline to the _pipeline property', async () => {
    // given
    const definition = await load('write.ttl')
    const node = clownface(definition, pipelineTerm)

    // when
    const stream = createPipelineStream(node)

    // then
    strictEqual(stream._pipeline instanceof Pipeline, true)
  })

  it('should have a clone method', async () => {
    // given
    const definition = await load('write.ttl')
    const node = clownface(definition, pipelineTerm)

    // when
    const stream = createPipelineStream(node)

    // then
    strictEqual(typeof stream.clone, 'function')
  })

  it('should have a basePath string property', async () => {
    // given
    const definition = await load('write.ttl')
    const node = clownface(definition, pipelineTerm)

    // when
    const stream = createPipelineStream(node)

    // then
    strictEqual(typeof stream.basePath, 'string')
  })

  it('should have a context object property', async () => {
    // given
    const definition = await load('write.ttl')
    const node = clownface(definition, pipelineTerm)

    // when
    const stream = createPipelineStream(node)

    // then
    strictEqual(typeof stream.context, 'object')
  })

  it('should have a node clownface property', async () => {
    // given
    const definition = await load('write.ttl')
    const node = clownface(definition, pipelineTerm)

    // when
    const stream = createPipelineStream(node)

    // then
    strictEqual(stream.node instanceof Clownface, true)
  })

  it('should have a variables Map property', async () => {
    // given
    const definition = await load('write.ttl')
    const node = clownface(definition, pipelineTerm)

    // when
    const stream = createPipelineStream(node)

    // then
    strictEqual(stream.variables instanceof Map, true)
  })

  it('should forward data from the last step to the pipeline stream', async () => {
    // given
    const definition = await load('write.ttl')
    const node = clownface(definition, pipelineTerm)
    const stream = createPipelineStream(node, { basePath: path.resolve('test'), loaderRegistry: createLoaderRegistry() })

    // when
    stream.end('test')
    await run(stream)

    // then
    strictEqual(stream.context.content.toString(), 'test')
  })

  it('should forward data written to the pipeline stream to the first step', async () => {
    // given
    const definition = await load('read.ttl')
    const node = clownface(definition, pipelineTerm)
    const stream = createPipelineStream(node, { basePath: path.resolve('test'), loaderRegistry: createLoaderRegistry() })

    // when
    const content = await run(stream)

    // then
    strictEqual(content.toString(), 'test')
  })

  it('should handle step creating errors', async () => {
    // given
    const definition = await load('step-error.ttl')
    const node = clownface(definition, pipelineTerm)
    const stream = createPipelineStream(node, { basePath: path.resolve('test'), loaderRegistry: createLoaderRegistry() })

    // when
    const promise = run(stream)

    // then
    await rejects(promise)
  })

  describe('PlainPipeline', () => {
    it('should emit an end event', async () => {
      // given
      const definition = await load('plain.ttl')
      const node = clownface(definition, pipelineTerm)
      const stream = createPipelineStream(node, { basePath: path.resolve('test'), loaderRegistry: createLoaderRegistry() })

      // when
      stream.resume()
      await eventToPromise(stream, 'end')

      // then
      // expect to reach this point
    })
  })

  describe('ReadablePipeline', () => {
    it('should emit an end event', async () => {
      // given
      const definition = await load('read.ttl')
      const node = clownface(definition, pipelineTerm)
      const stream = createPipelineStream(node, { basePath: path.resolve('test'), loaderRegistry: createLoaderRegistry() })

      // when
      stream.resume()
      await eventToPromise(stream, 'end')

      // then
      // expect to reach this point
    })
  })

  describe('WriteablePipeline', () => {
    it('should emit a finish event', async () => {
      // given
      const definition = await load('write.ttl')
      const node = clownface(definition, pipelineTerm)
      const stream = createPipelineStream(node, { basePath: path.resolve('test'), loaderRegistry: createLoaderRegistry() })
      const waitForFinish = eventToPromise(stream, 'finish')

      // when
      stream.end()
      await waitForFinish

      // then
      // expect to reach this point
    })

    it('should forward the end of stream event to the step', async () => {
      // given
      const definition = await load('write.ttl')
      const node = clownface(definition, pipelineTerm)
      const stream = createPipelineStream(node, { basePath: path.resolve('test'), loaderRegistry: createLoaderRegistry() })
      stream.write('test')
      await stream._pipeline.init()
      const waitForFinish = eventToPromise(stream._pipeline.streams[0], 'finish')

      // when
      stream.end()
      await waitForFinish

      // then
      // expect to reach this point
    })
  })
})
