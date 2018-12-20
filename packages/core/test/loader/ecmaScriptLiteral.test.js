/* global describe, test, beforeEach */
const rdf = require('rdf-ext')
const expect = require('expect')
const ns = require('../../lib/namespaces')
const loader = require('../../lib/loader/ecmaScriptLiteral')

describe('ecmaScriptTemplate loader', () => {
  let dataset

  beforeEach(() => {
    dataset = rdf.dataset()
  })

  test('should return string filled in with variables', () => {
    // given
    // eslint-disable-next-line no-template-curly-in-string
    const node = rdf.literal('Hello ${hello}', ns.code('EcmaScriptTemplateLiteral'))
    const variables = new Map()
    variables.set('hello', 'world')

    // when
    const string = loader(node, dataset, { context: {}, variables })

    // then
    expect(string).toBe('Hello world')
  })

  test('should throw if node is not literal', () => {
    // given
    const node = rdf.namedNode('not:literal:node')

    // then
    expect(() => {
      // when
      loader(node)
    }).toThrow()
  })
})
