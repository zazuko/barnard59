/* global describe, test */
const createPipelineStream = require('../lib/createPipelineStream')
const expect = require('expect')
const factory = require('../lib/pipelineFactory')
const isStream = require('isstream')
const load = require('./support/load-pipeline')
const path = require('path')
const run = require('./support/run')
const Clownface = require('clownface/lib/Clownface')
const Pipeline = require('../lib/pipeline')

describe('createPipelineStream', () => {
  test('returns a stream', async () => {
    // given
    const definition = await load('write.ttl')
    const pipeline = factory(definition, 'http://example.org/pipeline/')

    // when
    const stream = createPipelineStream(pipeline._pipeline)

    // then
    expect(isStream(stream)).toBe(true)
  })

  test('inner pipeline is assigned to _pipeline property', async () => {
    // given
    const definition = await load('write.ttl')
    const pipeline = factory(definition, 'http://example.org/pipeline/')

    // when
    const stream = createPipelineStream(pipeline._pipeline)

    // then
    expect(stream._pipeline instanceof Pipeline).toBe(true)
  })

  test('clone is a method', async () => {
    // given
    const definition = await load('write.ttl')
    const pipeline = factory(definition, 'http://example.org/pipeline/')

    // when
    const stream = createPipelineStream(pipeline._pipeline)

    // then
    expect(typeof stream.clone).toBe('function')
  })

  test('basePath is a string property', async () => {
    // given
    const definition = await load('write.ttl')
    const pipeline = factory(definition, 'http://example.org/pipeline/')

    // when
    const stream = createPipelineStream(pipeline._pipeline)

    // then
    expect(typeof stream.basePath).toBe('string')
  })

  test('context is a object property', async () => {
    // given
    const definition = await load('write.ttl')
    const pipeline = factory(definition, 'http://example.org/pipeline/')

    // when
    const stream = createPipelineStream(pipeline._pipeline)

    // then
    expect(typeof stream.context).toBe('object')
  })

  test('node is a clownface property', async () => {
    // given
    const definition = await load('write.ttl')
    const pipeline = factory(definition, 'http://example.org/pipeline/')

    // when
    const stream = createPipelineStream(pipeline._pipeline)

    // then
    expect(stream.node instanceof Clownface).toBe(true)
  })

  test('variables is a Map property', async () => {
    // given
    const definition = await load('write.ttl')
    const pipeline = factory(definition, 'http://example.org/pipeline/')

    // when
    const stream = createPipelineStream(pipeline._pipeline)

    // then
    expect(stream.variables instanceof Map).toBe(true)
  })

  test('write on pipeline is forwarded to stream', async () => {
    // given
    const definition = await load('write.ttl')
    const pipeline = factory(definition, 'http://example.org/pipeline/')
    const stream = createPipelineStream(pipeline._pipeline)

    // when
    stream.end('test')
    await run(stream)

    // then
    expect(pipeline.context.content.toString()).toBe('test')
  })

  test('read on pipeline is forwarded to stream', async () => {
    // given
    const definition = await load('read.ttl')
    const pipeline = factory(definition, 'http://example.org/pipeline/', {
      basePath: path.resolve('test')
    })
    const stream = createPipelineStream(pipeline._pipeline)

    // when
    const content = await run(stream)

    // then
    expect(content.toString()).toBe('test')
  })
})
