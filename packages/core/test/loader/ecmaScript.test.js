/* global describe, test, beforeEach */
const cf = require('clownface')
const rdf = require('rdf-ext')
const expect = require('expect')
const loader = require('../../lib/loader/ecmaScript')
const ns = require('../../lib/namespaces')
const namespace = require('@rdfjs/namespace')

describe('ecmaScript loader', () => {
  const example = namespace('http://example.org/pipeline#')
  let dataset
  let def
  const context = {
    basePath: '/some/path'
  }

  beforeEach(async () => {
    dataset = rdf.dataset()
    def = cf(dataset, rdf.namedNode('http://example.com/'))
  })

  describe('loading literal', () => {
    test('should return function parsed from value', () => {
      // given
      // eslint-disable-next-line no-template-curly-in-string
      const node = rdf.literal('who => `Hello ${who}`', ns.code('ecmaScript'))

      // when
      const code = loader(node, dataset, context)

      // then
      const result = code('world')
      expect(result).toBe('Hello world')
    })

    test('should throw if node does not have correct datatype', () => {
      // given
      const node = rdf.literal("() => 'nothing'", ns.code('unrecognized'))

      // then
      expect(() => loader(node)).toThrow()
    })
  })

  describe('loading from node:', () => {
    test('should return top export', () => {
      // given
      // <operation> code:link <node:barnard59-base#map>
      const node = def.node(example('operation'))
      node.addOut(ns.code('link'), rdf.namedNode('node:barnard59-base#map'))

      // when
      const code = loader(node.term, dataset, context)

      // then
      expect(code.name).toBe('map')
    })

    test('should return correct function if using dot notation', () => {
      // given
      // <operation> code:link <node:barnard59-formats#jsonld.parse.object>
      const node = def.node(example('operation'))
      node.addOut(ns.code('link'), rdf.namedNode('node:barnard59-formats#jsonld.parse.object'))

      // when
      const code = loader(node.term, dataset, context)

      // then
      expect(typeof code).toBe('function')
    })
  })
})
