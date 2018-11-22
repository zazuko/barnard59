/* global describe, test */
const assert = require('assert')
const expect = require('expect')
const Pipeline = require('../lib/pipeline')
const load = require('./support/load-pipeline')
const ns = require('./support/namespaces')

describe('pipeline', () => {
  describe('constructor', () => {
    test('loads the single pipeline from definition', async () => {
      // given
      const definition = await load('empty.ttl')

      // when
      const pipeline = Pipeline(definition)

      // then
      assert.deepStrictEqual(pipeline.node.term, ns.pipeline('empty'))
    })

    test('loads selected pipeline when there are multiple', async () => {
      // given
      const definition = await load('multiple.ttl')

      // when
      const pipeline = Pipeline(definition, {
        iri: ns.pipeline('pipelineB')
      })

      // then
      assert.ok(pipeline)
    })

    test('throws when multiple pipelines are found without specifying the iri', async () => {
      // given
      const definition = await load('multiple.ttl')

      // then
      assert.throws(() => {
        // when
        Pipeline(definition)
      })
    })
  })

  describe('variables', () => {
    test('should be parsed from definition', async () => {
      // given
      const definition = await load('variables.ttl')
      const iri = ns.pipeline('inline')

      // when
      const pipeline = Pipeline(definition, { iri })

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
      const pipeline = Pipeline(definition, { iri, variables })

      // then
      expect(pipeline.variables.size).toBe(2)
      expect(pipeline.variables.get('hello')).toBe('world')
    })

    test('should get combined from multiple sets', async () => {
      // given
      const definition = await load('variables.ttl')
      const iri = ns.pipeline('multiset')

      // when
      const pipeline = Pipeline(definition, { iri })

      // then
      expect(pipeline.variables.size).toBe(2)
      expect(pipeline.variables.get('username')).toBe('tpluscode')
      expect(pipeline.variables.get('auth')).toBe('http://auth0.com/connetc/token')
    })
  })
})
