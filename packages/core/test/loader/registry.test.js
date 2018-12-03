/* global describe, test, beforeEach */
const cf = require('clownface')
const rdf = require('rdf-ext')
const expect = require('expect')
const assert = require('assert')
const LoaderRegistry = require('../../lib/loader/registry')
const ns = require('../../lib/namespaces')

describe('LoaderRegistry', () => {
  let registry
  let dataset
  let def

  beforeEach(() => {
    registry = new LoaderRegistry()
    dataset = rdf.dataset()
    def = cf(dataset)
  })

  describe('registerLiteralLoader', () => {
    test('should add to registry', () => {
      // given
      const loader = {}

      // when
      registry.registerLiteralLoader('http://example.com/code/ecmaScriptTemplate', loader)

      // then
      expect(registry._literalLoaders.size).toBe(1)
    })

    test('can be called with named node parameter', () => {
      // given
      const loader = {}

      // when
      registry.registerLiteralLoader(rdf.namedNode('http://example.com/code/ecmaScript'), loader)

      // then
      assert.ok(registry._literalLoaders.get('http://example.com/code/ecmaScript'))
    })
  })

  describe('registerNodeLoader', () => {
    test('should add to registry', () => {
      // given
      const loader = {}

      // when
      registry.registerNodeLoader('http://example.com/code/ecmaScript', loader)

      // then
      expect(registry._nodeLoaders.size).toBe(1)
    })

    test('can be called with named node parameter', () => {
      // given
      const loader = {}

      // when
      registry.registerNodeLoader(rdf.namedNode('http://example.com/code/ecmaScript'), loader)

      // then
      assert.ok(registry._nodeLoaders.get('http://example.com/code/ecmaScript'))
    })
  })

  describe('load', () => {
    test('should invoke found node loader', () => {
      // given
      const loader = () => 'success'
      registry.registerNodeLoader('http://example.com/code/script', loader)
      const node = def.node(rdf.namedNode(''))
      node.addOut(ns.rdf('type'), 'http://example.com/code/script')

      // when
      const result = registry.load(node)

      // then
      expect(result).toBe('success')
    })

    test('should invoke found literal loader', () => {
      // given
      const loader = () => 'success'
      registry.registerLiteralLoader('http://example.com/code/script', loader)

      // when
      const result = registry.load(def.node(rdf.literal('test', rdf.namedNode('http://example.com/code/script'))))

      // then
      expect(result).toBe('success')
    })

    test('should return null if node loader is not found', () => {
      // given
      const loader = () => 'success'
      registry.registerNodeLoader('http://example.com/code/script', loader)
      registry.registerLiteralLoader('http://example.com/code/script', loader)
      const node = def.node(rdf.namedNode(''))
      node.addOut(ns.rdf('type'), 'http://example.com/code/other/type')

      // when
      const result = registry.load(node)

      // then
      expect(result).toBeNull()
    })

    test('should return null if literal loader is not found', () => {
      // given
      const loader = () => 'success'
      registry.registerNodeLoader('http://example.com/code/script', loader)
      registry.registerLiteralLoader('http://example.com/code/script', loader)

      // when
      const result = registry.load(def.node(rdf.literal('test', rdf.namedNode('http://example.com/other/type'))))

      // then
      expect(result).toBeNull()
    })
  })
})
