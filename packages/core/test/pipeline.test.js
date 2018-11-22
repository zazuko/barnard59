/* global describe, test */
const assert = require('assert')
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
})
