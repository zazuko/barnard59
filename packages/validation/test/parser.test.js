const parser = require('../lib/parser')
const { describe, it } = require('mocha')
const assert = require('assert')
const path = require('path')
const sinon = require('sinon')
const iriResolve = require('rdf-loader-code/lib/iriResolve')
class ClownfaceMock {
  namedNode () {
    return null
  }

  has () {
    return null
  }

  in () {
    return null
  }

  out () {
    return null
  }
}

describe('parser.getDependencies', () => {
  it('should create tree structre for codelinks', () => {
    const input = ['node:barnard59-base#fetch.json',
      'node:barnard59-base#map',
      'node:barnard59-formats#ntriples.serialize',
      'file:awesomeModule#awesomeFunction'
    ]
    const expected = {
      'node:': {
        'barnard59-base': new Set(['node:barnard59-base#fetch.json', 'node:barnard59-base#map']),
        'barnard59-formats': new Set(['node:barnard59-formats#ntriples.serialize'])
      },
      'file:': {
        [path.join(process.cwd(), 'awesomeModule')]: new Set(['file:awesomeModule#awesomeFunction'])
      }
    }
    const actual = parser.getDependencies(input)
    assert.deepStrictEqual(expected, actual)
  })

  it('should fail with noniterable input', () => {
    const input = 'node:barnard59-base#fetch.json'
    assert.throws(() => parser.getDependencies(input), TypeError)
  })

  it('should forward iriResolve error', () => {
    const input = ['abc']
    try {
      iriResolve(input[0], process.cwd())
      assert.fail('The input is invalid')
    }
    catch (expectedError) {
      assert.throws(() => parser.getDependencies(input), expectedError)
    }
  })
})

describe('parser.getAllCodeLinks', () => {
  it('should transform dict values to set', () => {
    const input = {
      pancakes: ['flour', 'eggs', 'milk', 'olive oil'],
      brioche: ['flour', 'milk', 'butter', 'yeast']
    }
    const expected = new Set(['flour', 'eggs', 'milk', 'olive oil', 'butter', 'yeast'])
    const actual = parser.getAllCodeLinks(input)
    assert.deepStrictEqual(expected, actual)
  })
})

describe('parser.readGraph', () => {
  it('should read .ttl file and create DatasetCore object', async () => {
    const input = path.join(__dirname, 'example.ttl')
    const graph = await parser.readGraph(input)
    const actual = graph.dataset.toString()

    const expected = `<http://example.org/pipeline/serialize> <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <https://pipeline.described.at/Step> .
_:b1 <https://code.described.at/link> <node:barnard59-formats#ntriples.serialize> .
_:b1 <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <https://code.described.at/EcmaScript> .
<http://example.org/pipeline/serialize> <https://code.described.at/implementedBy> _:b1 .
`
    assert.strictEqual(actual, expected)
  })
})

describe('parser.getModuleOperationProperties', () => {
  // Mock input properties
  const ids = ['Christian Andersen', 'Johnny Bravo', 'Pikachu']
  const andersenNodes = [{
    term: {
      value: 'prefix/writer'
    }
  },
  {
    term: {
      value: 'prefix/Dannish'
    }
  }]
  const bravoNodes = [{
    term: {
      value: 'prefix/narcissist'
    }
  },
  {
    term: {
      value: 'prefix/womanizer'
    }
  }]
  const picachuNodes = []

  const graph = sinon.createStubInstance(ClownfaceMock, {
    namedNode: sinon.stub().returnsThis(),
    in: sinon.stub().returnsThis()
  })

  graph.out.onCall(0).returns(andersenNodes)
  graph.out.onCall(1).returns(bravoNodes)
  graph.out.onCall(2).returns(picachuNodes)

  it('should create properties tree for identifiers', () => {
    const actual = parser.getModuleOperationProperties(graph, ids)
    const expected = {
      'Christian Andersen': ['writer', 'Dannish'],
      'Johnny Bravo': ['narcissist', 'womanizer'],
      Pikachu: null
    }
    assert.deepStrictEqual(actual, expected)
  })
})
