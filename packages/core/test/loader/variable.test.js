/* global describe, test, beforeEach */
const cf = require('clownface')
const rdf = require('rdf-ext')
const expect = require('expect')
const loader = require('../../lib/loader/variable')
const ns = require('../../lib/namespaces')
const namespace = require('@rdfjs/namespace')

describe('variable loader', () => {
  const example = namespace('http://example.org/pipeline#')
  let dataset
  let def

  beforeEach(async () => {
    dataset = rdf.dataset()
    def = cf(dataset, rdf.namedNode('http://example.com/'))
  })

  test('loads variable from the map by name', () => {
    // given
    const node = def.node(example('var'))
    node.addOut(ns.rdf('type'), ns.p('Variable'))
      .addOut(ns.p('name'), 'foo')
    const variables = new Map([ [ 'foo', 'bar' ] ])

    // when
    const result = loader(node, dataset, { variables })

    // then
    expect(result).toBe('bar')
  })

  test('loads variable from the node if not present in variable map', () => {
    // given
    const node = def.node(example('var'))
    node.addOut(ns.rdf('type'), ns.p('Variable'))
      .addOut(ns.p('name'), 'foo')
      .addOut(ns.p('value'), 'bar')
    const variables = new Map()

    // when
    const result = loader(node, dataset, { variables })

    // then
    expect(result).toBe('bar')
  })
})
