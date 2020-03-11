const assert = require('assert')
const expect = require('expect')
const path = require('path')
const Pipeline = require('../lib/pipelineFactory')
const load = require('./support/load-pipeline')
const ns = require('./support/namespaces')
const streamToArray = require('./support/streamToArray')

describe('pipeline', () => {
  describe('constructor', () => {
    test('loads selected pipeline when there are multiple', async () => {
      // given
      const definition = await load('multiple.ttl')

      // when
      const pipeline = Pipeline(definition, ns.pipeline('pipelineB'))

      // then
      assert.ok(pipeline)
    })

    test('throws when the iri is missing', async () => {
      // given
      const definition = await load('multiple.ttl')

      // then
      assert.throws(() => {
        // when
        Pipeline(definition)
      })
    })

    test('throws when the pipeline is not found', async () => {
      // given
      const definition = await load('multiple.ttl')

      // then
      assert.throws(() => {
        // when
        Pipeline(definition, ns.pipeline('no-such-pipeline'))
      })
    })
  })

  describe('variables', () => {
    test('should be parsed from definition', async () => {
      // given
      const definition = await load('variables.ttl')
      const iri = ns.pipeline('inline')

      // when
      const pipeline = Pipeline(definition, iri)
      await pipeline._pipeline.initVariables()

      // then
      expect(pipeline.variables.get('foo')).toBe('bar')
    })

    test('should combine values from definition and constructor call', async () => {
      // given
      const definition = await load('variables.ttl')
      const variables = new Map()
      variables.set('hello', 'world')
      const iri = ns.pipeline('inline')

      // when
      const pipeline = Pipeline(definition, iri, { variables })
      await pipeline._pipeline.initVariables()

      // then
      expect(pipeline.variables.size).toBe(2)
      expect(pipeline.variables.get('hello')).toBe('world')
    })

    test('should get combined from multiple sets', async () => {
      // given
      const definition = await load('variables.ttl')
      const iri = ns.pipeline('multiset')

      // when
      const pipeline = Pipeline(definition, iri)
      await pipeline._pipeline.initVariables()

      // then
      expect(pipeline.variables.size).toBe(2)
      expect(pipeline.variables.get('username')).toBe('tpluscode')
      expect(pipeline.variables.get('auth')).toBe('http://auth0.com/connect/token')
    })

    test('should prefer variable from constructor over that from definition', async () => {
      // given
      const definition = await load('variables.ttl')
      const variables = new Map()
      variables.set('foo', 'boar')
      const iri = ns.pipeline('inline')

      // when
      const pipeline = Pipeline(definition, iri, { variables })
      await pipeline._pipeline.initVariables()

      // then
      expect(pipeline.variables.size).toBe(1)
      expect(pipeline.variables.get('foo')).toBe('boar')
    })
  })

  describe('steps', () => {
    describe('arguments', () => {
      test('should accept arguments as rdf:List', async () => {
        // given
        const definition = await load('arguments.ttl')
        const iri = ns.pipeline('list')

        // when
        const pipeline = Pipeline(definition, iri, { basePath: path.resolve('test') })
        const content = await streamToArray(pipeline)

        // then
        expect(content).toEqual(['a', 'b'])
      })

      test('should accept arguments as key value pairs', async () => {
        // given
        const definition = await load('arguments.ttl')
        const iri = ns.pipeline('key-values')

        // when
        const pipeline = Pipeline(definition, iri, { basePath: path.resolve('test') })
        const content = await streamToArray(pipeline)

        // then
        expect(content).toEqual([{ a: '1', b: '2' }])
      })
    })
  })

  describe('run', () => {
    test('should forward stream errors to the logger', async () => {
      // given
      const definition = await load('stream-error.ttl')
      const iri = ns.pipeline('')

      // when
      const errors = []
      const pipeline = Pipeline(definition, iri, { basePath: path.resolve('test') })

      pipeline.context.log.on('data', message => {
        if (message.level === 'ERROR') {
          errors.push(message)
        }
      })

      try {
        await streamToArray(pipeline)
      } catch (err) {}

      // then
      assert.strictEqual(errors.length, 1)
      assert.strictEqual(errors[0].message.includes('error in pipeline step http://example.org/pipeline/error'), true)
      assert.strictEqual(errors[0].message.includes('at ReadStream'), true)
    })
  })
})
