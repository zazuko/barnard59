/* global describe, test, beforeEach */
const cf = require('clownface')
const rdf = require('rdf-ext')
const expect = require('expect')
const loader = require('../../lib/loader/pipeline')
const namespace = require('@rdfjs/namespace')
const ns = require('../../lib/namespaces')

describe('pipeline loader', () => {
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

  test("should inherit parent's variables", async () => {
    // given
    const node = def.node(example('sub-pipeline'))
      .addOut(ns.rdf('type'), ns.p('Pipeline'))
    const variables = new Map([
      ['foo', 'bar'],
      ['hello', 'world']
    ])

    // when
    const pipeline = loader(node, dataset, { context, variables, basePath: context.basePath })
    await pipeline._pipeline.initVariables()

    // then
    expect(pipeline.variables.get('foo')).toBe('bar')
    expect(pipeline.variables.get('hello')).toBe('world')
  })

  test('should throw if references resource does not have a type', () => {
    // given
    const node = def.node(example('sub-pipeline'))

    // then
    expect(() => loader(node.term, dataset)).toThrow()
  })

  test('should throw if references resource does not have a pipeline type', () => {
    // given
    const node = def.node(example('sub-pipeline'))
      .addOut(ns.rdf('type'), example('CustomPipeline'))

    // then
    expect(() => loader(node.term, dataset)).toThrow()
  })

  describe('when referencing an object pipeline', () => {
    test('should initialize pipeline in object mode', () => {
      // given
      const node = def.node(example('sub-pipeline'))
        .addOut(ns.rdf('type'), ns.p('Pipeline'))
        .addOut(ns.rdf('type'), ns.p('ReadableObjectMode'))

      // when
      const pipeline = loader(node, dataset, { context, variables: new Map(), basePath: context.basePath })

      // then
      expect(pipeline._readableState.objectMode).toBeTruthy()
    })
  })

  describe('when referencing a code:Pipeline', () => {
    test('should not initialize pipeline in object mode', () => {
      // given
      const node = def.node(example('sub-pipeline'))
        .addOut(ns.rdf('type'), ns.p('Pipeline'))

      // when
      const pipeline = loader(node, dataset, { context, variables: new Map(), basePath: context.basePath })

      // then
      expect(pipeline._readableState.objectMode).toBeFalsy()
    })
  })
})
