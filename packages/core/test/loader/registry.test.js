/* global describe, test, beforeEach */
const expect = require('expect')
const LoaderRegistry = require('../../lib/loader/registry')

describe('LoaderRegistry', () => {
  let registry

  beforeEach(() => {
    registry = new LoaderRegistry()
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
  })
})
