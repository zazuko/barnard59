const { deepStrictEqual, strictEqual, throws } = require('assert')
const path = require('path')
const { describe, it } = require('mocha')
const Pipeline = require('../lib/pipelineFactory')
const load = require('./support/load-pipeline')
const ns = require('./support/namespaces')
const streamToArray = require('./support/streamToArray')

describe('pipeline', () => {
  describe('constructor', () => {
    it('should load the selected pipeline when there are multiple', async () => {
      // given
      const definition = await load('multiple.ttl')

      // when
      const pipeline = Pipeline(definition, ns.pipeline('pipelineB'))

      // then
      strictEqual(Boolean(pipeline), true)
    })

    it('should throw an error when the iri is missing', async () => {
      // given
      const definition = await load('multiple.ttl')

      // then
      throws(() => {
        // when
        Pipeline(definition)
      })
    })

    it('should throw an error when the pipeline is not found', async () => {
      // given
      const definition = await load('multiple.ttl')

      // then
      throws(() => {
        // when
        Pipeline(definition, ns.pipeline('no-such-pipeline'))
      })
    })
  })

  describe('variables', () => {
    it('should be parsed from definition', async () => {
      // given
      const definition = await load('variables.ttl')
      const iri = ns.pipeline('inline')

      // when
      const pipeline = Pipeline(definition, iri)
      await pipeline._pipeline.initVariables()

      // then
      strictEqual(pipeline.variables.get('foo'), 'bar')
    })

    it('should combine values from definition and constructor call', async () => {
      // given
      const definition = await load('variables.ttl')
      const variables = new Map()
      variables.set('hello', 'world')
      const iri = ns.pipeline('inline')

      // when
      const pipeline = Pipeline(definition, iri, { variables })
      await pipeline._pipeline.initVariables()

      // then
      strictEqual(pipeline.variables.size, 2)
      strictEqual(pipeline.variables.get('hello'), 'world')
    })

    it('should get combined from multiple sets', async () => {
      // given
      const definition = await load('variables.ttl')
      const iri = ns.pipeline('multiset')

      // when
      const pipeline = Pipeline(definition, iri)
      await pipeline._pipeline.initVariables()

      // then
      strictEqual(pipeline.variables.size, 2)
      strictEqual(pipeline.variables.get('username'), 'tpluscode')
      strictEqual(pipeline.variables.get('auth'), 'http://auth0.com/connect/token')
    })

    it('should prefer variable from constructor over that from definition', async () => {
      // given
      const definition = await load('variables.ttl')
      const variables = new Map()
      variables.set('foo', 'boar')
      const iri = ns.pipeline('inline')

      // when
      const pipeline = Pipeline(definition, iri, { variables })
      await pipeline._pipeline.initVariables()

      // then
      strictEqual(pipeline.variables.size, 1)
      strictEqual(pipeline.variables.get('foo'), 'boar')
    })
  })

  describe('steps', () => {
    describe('arguments', () => {
      it('should accept arguments as rdf:List', async () => {
        // given
        const definition = await load('arguments.ttl')
        const iri = ns.pipeline('list')

        // when
        const pipeline = Pipeline(definition, iri, { basePath: path.resolve('test') })
        const content = await streamToArray(pipeline)

        // then
        deepStrictEqual(content, ['a', 'b'])
      })

      it('should accept arguments as key value pairs', async () => {
        // given
        const definition = await load('arguments.ttl')
        const iri = ns.pipeline('key-values')

        // when
        const pipeline = Pipeline(definition, iri, { basePath: path.resolve('test') })
        const content = await streamToArray(pipeline)

        // then
        deepStrictEqual(content, [{ a: '1', b: '2' }])
      })
    })
  })

  describe('run', () => {
    it('should forward stream errors to the logger', async () => {
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
      strictEqual(errors.length, 1)
      strictEqual(errors[0].message.includes('error in pipeline step http://example.org/pipeline/error'), true)
      strictEqual(errors[0].message.includes('at ReadStream'), true)
    })
  })
})
