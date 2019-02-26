/* global describe, test */
const clownface = require('clownface')
const createLoaderRegistry = require('../lib/createLoaderRegistry')
const createPipelineStream = require('../lib/createPipelineStream')
const expect = require('expect')
const eventToPromise = require('../lib/eventToPromise')
const isStream = require('isstream')
const load = require('./support/load-pipeline')
const path = require('path')
const rdf = require('rdf-ext')
const run = require('./support/run')
const Clownface = require('clownface/lib/Clownface')
const Pipeline = require('../lib/Pipeline')

const pipelineTerm = rdf.namedNode('http://example.org/pipeline/')

describe('createPipelineStream', () => {
  test('returns a stream', async () => {
    // given
    const definition = await load('write.ttl')
    const node = clownface(definition, pipelineTerm)

    // when
    const stream = createPipelineStream(node)

    // then
    expect(isStream(stream)).toBe(true)
  })

  test('inner pipeline is assigned to _pipeline property', async () => {
    // given
    const definition = await load('write.ttl')
    const node = clownface(definition, pipelineTerm)

    // when
    const stream = createPipelineStream(node)

    // then
    expect(stream._pipeline instanceof Pipeline).toBe(true)
  })

  test('clone is a method', async () => {
    // given
    const definition = await load('write.ttl')
    const node = clownface(definition, pipelineTerm)

    // when
    const stream = createPipelineStream(node)

    // then
    expect(typeof stream.clone).toBe('function')
  })

  test('basePath is a string property', async () => {
    // given
    const definition = await load('write.ttl')
    const node = clownface(definition, pipelineTerm)

    // when
    const stream = createPipelineStream(node)

    // then
    expect(typeof stream.basePath).toBe('string')
  })

  test('context is a object property', async () => {
    // given
    const definition = await load('write.ttl')
    const node = clownface(definition, pipelineTerm)

    // when
    const stream = createPipelineStream(node)

    // then
    expect(typeof stream.context).toBe('object')
  })

  test('node is a clownface property', async () => {
    // given
    const definition = await load('write.ttl')
    const node = clownface(definition, pipelineTerm)

    // when
    const stream = createPipelineStream(node)

    // then
    expect(stream.node instanceof Clownface).toBe(true)
  })

  test('variables is a Map property', async () => {
    // given
    const definition = await load('write.ttl')
    const node = clownface(definition, pipelineTerm)

    // when
    const stream = createPipelineStream(node)

    // then
    expect(stream.variables instanceof Map).toBe(true)
  })

  test('write on pipeline is forwarded to stream', async () => {
    // given
    const definition = await load('write.ttl')
    const node = clownface(definition, pipelineTerm)
    const stream = createPipelineStream(node, { basePath: path.resolve('test'), loaderRegistry: createLoaderRegistry() })

    // when
    stream.end('test')
    await run(stream)

    // then
    expect(stream.context.content.toString()).toBe('test')
  })

  test('read on pipeline is forwarded to stream', async () => {
    // given
    const definition = await load('read.ttl')
    const node = clownface(definition, pipelineTerm)
    const stream = createPipelineStream(node, { basePath: path.resolve('test'), loaderRegistry: createLoaderRegistry() })

    // when
    const content = await run(stream)

    // then
    expect(content.toString()).toBe('test')
  })

  test('should handle step creating errors', async () => {
    // given
    const definition = await load('step-error.ttl')
    const node = clownface(definition, pipelineTerm)
    const stream = createPipelineStream(node, { basePath: path.resolve('test'), loaderRegistry: createLoaderRegistry() })

    // when
    const promise = run(stream)

    // then
    expect(promise).rejects.toBeInstanceOf(Error)
  })

  describe('PlainPipeline', () => {
    test('end event is emitted', async () => {
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
    test('end event is emitted', async () => {
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
    test('finish event is emitted', async () => {
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

    test('calling end is forwarded to the pipeline steps', async () => {
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
