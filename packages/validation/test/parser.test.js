import assert from 'node:assert'
import path from 'node:path'
import * as url from 'node:url'
import iriResolve from 'rdf-loader-code/lib/iriResolve.js'
import sinon from 'sinon'
import esmock from 'esmock'
import * as parser from '../lib/parser.js'
import ChecksCollection from '../lib/checksCollection.js'
import * as validators from '../lib/validators/index.js'
import { turtleToCF, genericContainsMessage, checkArrayContainsObject } from './helpers.js'

const __dirname = url.fileURLToPath(new URL('.', import.meta.url))

class ClownfaceMock {
  namedNode() {
    return null
  }

  has() {
    return null
  }

  in() {
    return null
  }

  out() {
    return null
  }

  list() {
    return null
  }
}

function generateGraphMock() {
  const pizzaSteps = sinon.createStubInstance(ClownfaceMock, {
    out: sinon.stub().returnsThis(),
  })
  pizzaSteps.term = { value: null }
  const steps = [
    'operation1',
    'Turn on the oven',
    '1',
    'operation2',
    'Put there frozen pizza',
    '2',
    'operation3',
    'Wait 30 min',
    '3',
    'operation4',
    'Enjoy!',
    '4',
  ]
  sinon.stub(pizzaSteps, 'term').get(function getterFn() {
    return { value: steps.shift() }
  })

  const pancakeSteps = sinon.createStubInstance(ClownfaceMock, {
    out: sinon.stub().returnsThis(),
  })
  pancakeSteps.term = { value: null }
  const steps2 = [
    'operation1',
    'Find a French chef',
    '11',
    'operation2',
    'Ask them to make you pancakes',
    '12',
  ]
  sinon.stub(pancakeSteps, 'term').get(function getterFn() {
    return { value: steps2.shift() }
  })

  const pancakesPipeline = sinon.createStubInstance(ClownfaceMock, {
    out: sinon.stub().returnsThis(),
    list: [pancakeSteps, pancakeSteps],
  })
  pancakesPipeline.term = { value: 'pancakes' }

  const pizzaPipeline = sinon.createStubInstance(ClownfaceMock, {
    out: sinon.stub().returnsThis(),
    list: [pizzaSteps, pizzaSteps, pizzaSteps, pizzaSteps],
  })
  pizzaPipeline.term = { value: 'pizza' }

  const graph = sinon.createStubInstance(ClownfaceMock, {
    has: [pizzaPipeline, pancakesPipeline],
  })
  return graph
}

describe('parser', function () {
  let checks

  beforeEach(async function () {
    checks = new ChecksCollection()
  })

  describe('getDependencies', function () {
    it('should create tree structure for codelinks', function () {
      const input = [
        { stepName: 'a', stepOperation: 'node:barnard59-base#fetch.json' },
        { stepName: 'b', stepOperation: 'node:barnard59-base#map' },
        { stepName: 'c', stepOperation: 'node:barnard59-formats#ntriples.serialize' },
        { stepName: 'd', stepOperation: 'file:awesomeModule#awesomeFunction' },
      ]
      const expected = {
        'node:': {
          'barnard59-base': new Set(['node:barnard59-base#fetch.json', 'node:barnard59-base#map']),
          'barnard59-formats': new Set(['node:barnard59-formats#ntriples.serialize']),
        },
        'file:': {
          [url.pathToFileURL(path.join(process.cwd(), 'awesomeModule'))]: new Set(['file:awesomeModule#awesomeFunction']),
        },
      }
      const actual = parser.getDependencies(input, process.cwd())
      assert.deepStrictEqual(expected, actual)
    })

    it('should fail with noniterable input', function () {
      const input = 'node:barnard59-base#fetch.json'
      assert.throws(() => parser.getDependencies(input), TypeError)
    })

    it('should forward iriResolve error', function () {
      const input = [{ stepOperation: 'abc' }]
      try {
        iriResolve(input[0].stepOperation, process.cwd())
        assert.fail('The input is invalid')
      }
      catch (expectedError) {
        assert.throws(() => parser.getDependencies(input), expectedError)
      }
    })
  })

  describe('getAllCodeLinks', function () {
    it('should collect dependency links across pipelines', function () {
      const source = { stepName: 'source', stepOperation: 'node:barnard59-base#stdin' }
      const sink = { stepName: 'sink', stepOperation: 'node:barnard59-base#stdout' }
      const input = {
        main: [
          source,
          { stepName: 'inline', stepOperation: 'inline', stepProperties: null },
          { stepName: 'nested', stepOperation: 'nested', stepProperties: ['Operation', 'Writable'] },
        ],
        nested: [sink],
      }
      const actual = parser.getAllCodeLinks(input)
      assert.deepStrictEqual(actual, new Set([source, sink]))
    })
  })

  describe('readGraph', function () {
    it('should read .ttl file and create DatasetCore object', async function () {
      const input = path.join(__dirname, 'fixtures/example.ttl')
      const graph = await parser.readGraph(input, new ChecksCollection())

      assert.strictEqual(graph.dataset.size, 4)
    })

    it('should resolve relative pipeline IRIs against the file URL', async function () {
      const input = path.join(__dirname, 'fixtures/relative-pipeline.ttl')
      const graph = await parser.readGraph(input, checks, { pipeline: true })
      const pipeline = new URL('main', url.pathToFileURL(input)).href

      assert.deepStrictEqual(parser.getPipelineProperties(graph, [pipeline]), {
        [pipeline]: ['Pipeline', 'Readable'],
      })
      assert.strictEqual(checks.getGenericChecks('info').length, 1)
    })

    it('should report a missing pipeline file', async function () {
      const input = path.join(__dirname, 'fixtures/missing.ttl')

      assert.strictEqual(await parser.readGraph(input, checks, { pipeline: true }), undefined)
      const [error] = checks.getGenericChecks('error')
      assert.match(error.message, /ENOENT: no such file or directory/)
      assert.ok(error.message.includes(input))
    })
  })

  describe('getModuleOperationProperties', function () {
  // Mock input properties
    const ids = ['Christian Andersen', 'Johnny Bravo', 'Pikachu']
    const andersenNodes = [{
      term: {
        value: 'prefix/writer',
      },
    },
    {
      term: {
        value: 'prefix/Dannish',
      },
    }]
    const bravoNodes = [{
      term: {
        value: 'prefix/narcissist',
      },
    },
    {
      term: {
        value: 'prefix/womanizer',
      },
    }]
    const picachuNodes = []

    const graph = sinon.createStubInstance(ClownfaceMock, {
      namedNode: sinon.stub().returnsThis(),
      in: sinon.stub().returnsThis(),
    })

    graph.out.onCall(0).returns(andersenNodes)
    graph.out.onCall(1).returns(bravoNodes)
    graph.out.onCall(2).returns(picachuNodes)

    it('should create properties tree for identifiers', function () {
      const actual = parser.getModuleOperationProperties(graph, ids)
      const expected = {
        'Christian Andersen': ['writer', 'Dannish'],
        'Johnny Bravo': ['narcissist', 'womanizer'],
        'Pikachu': null,
      }
      assert.deepStrictEqual(actual, expected)
    })
  })

  describe('getIdentifiers', function () {
    it('should create pipelines list', function () {
      const input = generateGraphMock()
      const expected = {
        pizza: [
          { stepName: 'Turn on the oven', stepOperation: 'operation1' },
          { stepName: 'Put there frozen pizza', stepOperation: 'operation2' },
          { stepName: 'Wait 30 min', stepOperation: 'operation3' },
          { stepName: 'Enjoy!', stepOperation: 'operation4' },
        ],
        pancakes: [
          { stepName: 'Find a French chef', stepOperation: 'operation1' },
          { stepName: 'Ask them to make you pancakes', stepOperation: 'operation2' },
        ],
      }

      const actual = parser.getIdentifiers(input, checks)
      assert.deepStrictEqual(actual, expected)
    })

    it('should return only requested pipeline', function () {
      const input = generateGraphMock()
      const expected = {
        pancakes: [
          { stepName: 'Find a French chef', stepOperation: 'operation1' },
          { stepName: 'Ask them to make you pancakes', stepOperation: 'operation2' },
        ],
      }
      const actual = parser.getIdentifiers(input, checks, 'pancakes')
      assert.deepStrictEqual(actual, expected)
    })

    it('should return empty dict if pipeline does not exist', function () {
      const input = generateGraphMock()
      const expected = {}
      const actual = parser.getIdentifiers(input, checks, 'inexistentPipeline')
      assert.deepStrictEqual(actual, expected)
    })

    it('should collect reachable nested pipelines once, including blank nodes', async function () {
      const input = await parser.readGraph(path.join(__dirname, 'fixtures/selected-nested.ttl'), checks)
      const actual = parser.getIdentifiers(input, checks, 'urn:main')
      const [nestedStep] = actual['urn:nested']
      const blankPipeline = nestedStep.stepName
      const asStep = id => ({ stepName: id, stepOperation: id, stepProperties: ['Operation', 'Pipeline', 'Readable'] })

      assert.deepStrictEqual(actual, {
        'urn:main': [asStep('urn:nested')],
        'urn:nested': [asStep(blankPipeline)],
        [blankPipeline]: [asStep('urn:main')],
      })
      assert.deepStrictEqual(parser.getPipelineProperties(input, Object.keys(actual)), {
        'urn:main': ['Pipeline', 'Readable'],
        'urn:nested': ['Pipeline', 'Readable'],
        [blankPipeline]: ['Pipeline', 'Readable'],
      })
      assert.deepStrictEqual(checks.getChecks('error').map(issue => issue.step), ['urn:broken'])
    })

    it('should check every pipeline once when no pipeline is selected', async function () {
      const input = await parser.readGraph(path.join(__dirname, 'fixtures/selected-nested.ttl'), checks)

      parser.getIdentifiers(input, checks)

      assert.deepStrictEqual(checks.getChecks('error').map(issue => issue.step).sort(), [
        'urn:broken',
        'urn:unrelated-broken',
      ])
    })

    it('should retain inline ECMAScript steps without dependency links', async function () {
      const input = await turtleToCF(`
        PREFIX p: <https://pipeline.described.at/>
        PREFIX code: <https://code.described.at/>

        <urn:main> a p:Pipeline ; p:steps [ p:stepList ( <urn:inline> ) ] .
        <urn:inline> a p:Step ; code:implementedBy "value => value"^^code:EcmaScript .
      `)

      const actual = parser.getIdentifiers(input, checks)

      assert.deepStrictEqual(actual, {
        'urn:main': [{ stepName: 'urn:inline', stepOperation: 'urn:inline', stepProperties: null }],
      })
      assert.deepStrictEqual(checks.getChecks(), [])
    })

    it('should not crash on invalid steps', async function () {
      const input = await turtleToCF(`
      @prefix p: <https://pipeline.described.at/> .

      <mainCreateFile> a p:Pipeline, p:Readable;
        p:variables _:vars ;
        p:steps [
          p:stepList (<mainUpload>)
        ].

      <mainUpload> a p:Pipeline;
        p:variables _:vars ;
        p:steps [ p:stepList <missingList> ] .
    `)

      const expected = {
        mainCreateFile: [],
        mainUpload: [],
      }
      const actual = parser.getIdentifiers(input, checks)
      assert.deepStrictEqual(actual, expected)

      const errors = checks.getPipelineChecks('mainCreateFile', ['error'])
      assert.strictEqual(errors.length, 1)
      const error = errors[0]
      assert.strictEqual(error.level, 'error')
      assert.strictEqual(error.message, validators.codelink.messageFailureTemplate())
      assert.strictEqual(error.step, 'mainUpload')
    })
  })

  describe('getAllOperationProperties', function () {
    it('should get operation properties from manifest.ttl file', async function () {
      const mockedParser = await esmock('../lib/parser.js', {
        '../lib/utils.js': {
          getManifestPath: sinon.stub().returns(path.resolve(__dirname, 'fixtures/manifest.ttl')),
          isModuleInstalled: sinon.stub().returns(true),
        },
      })

      const input = {
        'node:': {
          sinon: new Set(['node:party-module#dance', 'node:party-module#drink']),
        },
      }
      const expected = {
        'node:party-module#dance': null,
        'node:party-module#drink': ['Operation', 'Writable', 'Readable'],
      }

      const actual = await mockedParser.getAllOperationProperties(input, checks)
      assert.deepStrictEqual(actual, expected)
    })

    it("should return nulls if manifest.ttl doesn't exist", async function () {
      const parser = await esmock('../lib/parser.js', {
        '../lib/utils.js': {
          getManifestPath: sinon.stub().returns(null),
        },
      })

      const input = {
        'node:': {
          sinon: new Set(['node:party-module#dance', 'node:party-module#drink']),
          mocha: new Set(['node:work-module#code', 'node:work-module#sleep']),
        },
      }

      const expected = {
        'node:party-module#dance': null,
        'node:party-module#drink': null,
        'node:work-module#code': null,
        'node:work-module#sleep': null,
      }

      const actual = await parser.getAllOperationProperties(input, checks)
      assert.deepStrictEqual(actual, expected)
    })

    it('should return properties for existing operations, and nulls for nonexisting ones', async function () {
      const parser = await esmock('../lib/parser.js', {
        '../lib/utils.js': {
          getManifestPath: sinon.stub().returns(path.resolve(__dirname, 'fixtures/manifest.ttl')),
          isModuleInstalled: sinon.stub().returns(true),
        },
      })

      const input = {
        'node:': {
          sinon: new Set(['node:party-module#dance', 'node:party-module#drink']),
          mocha: new Set(['node:work-module#code', 'node:work-module#sleep']),
        },
      }

      const expected = {
        'node:party-module#dance': null,
        'node:party-module#drink': ['Operation', 'Writable', 'Readable'],
        'node:work-module#code': null,
        'node:work-module#sleep': null,
      }

      const actual = await parser.getAllOperationProperties(input, checks)
      assert.deepStrictEqual(actual, expected)
    })

    it('should report missing packages', async function () {
      const parser = await esmock('../lib/parser.js', {
        '../lib/utils.js': {
          isModuleInstalled: sinon.stub().returns(false),
        },
      })
      const input = {
        'node:': {
          'foo-bar': new Set(['node:foo-bar#fn']),
        },
      }

      const expected = {}
      const actual = await parser.getAllOperationProperties(input, checks)
      assert.deepStrictEqual(actual, expected)

      const expectedMssg = validators.dependency.messageFailureTemplate({ library: 'foo-bar', operations: 'node:foo-bar#fn', dependencyType: 'package' })
      assert(genericContainsMessage(checks, expectedMssg))
    })

    it('should report malformed manifests and keep loading other manifests', async function () {
      const invalidManifest = path.join(__dirname, 'fixtures/invalid.ttl')
      const getManifestPath = sinon.stub().returns(path.join(__dirname, 'fixtures/manifest.ttl'))
      getManifestPath.withArgs('mocha').returns(invalidManifest)
      const mockedParser = await esmock('../lib/parser.js', {
        '../lib/utils.js': {
          getManifestPath,
          isModuleInstalled: sinon.stub().returns(true),
        },
      })
      const input = {
        'node:': {
          mocha: new Set(['node:mocha#run']),
          sinon: new Set(['node:party-module#drink']),
        },
      }

      assert.deepStrictEqual(await mockedParser.getAllOperationProperties(input, checks), {
        'node:party-module#drink': ['Operation', 'Writable', 'Readable'],
      })
      const errors = checks.getGenericChecks('error')
      assert.strictEqual(errors.length, 1)
      assert.ok(errors[0].message.startsWith(`Cannot parse ${invalidManifest}:\n`))
      assert.match(errors[0].message, /Line 8:\n\s+p:variable \{\}$/)
    })
  })

  describe('getPipelineProperties', function () {
    const pipeline = {
      term: {
        value: null,
      },
    }
    const pipelinesProperties = [
      'https://pipeline.described.at/Pipeline',
      'https://pipeline.described.at/Crunchy',
      'https://pipeline.described.at/Pipeline',
      'https://pipeline.described.at/Soft',

    ]
    sinon.stub(pipeline, 'term').get(function getterFn() {
      return { value: pipelinesProperties.shift() }
    })

    const graph = sinon.createStubInstance(ClownfaceMock, {
      namedNode: sinon.stub().returnsThis(),
    })

    const pipelinesIDs = ['pizza', 'pancakes']

    it('should extract pipeline properties', function () {
      graph.out.onCall(0).returns([pipeline, pipeline])
      graph.out.onCall(1).returns([pipeline, pipeline])

      const actual = parser.getPipelineProperties(graph, pipelinesIDs)
      const expected = {
        pizza: ['Pipeline', 'Crunchy'],
        pancakes: ['Pipeline', 'Soft'],
      }
      assert.deepStrictEqual(actual, expected)
    })

    it('should return null when no properties exist', function () {
      graph.out.onCall(2).returns([])
      graph.out.onCall(3).returns([])
      const actual = parser.getPipelineProperties(graph, pipelinesIDs)
      const expected = {
        pizza: null,
        pancakes: null,
      }
      assert.deepStrictEqual(actual, expected)
    })
  })

  describe('validatePipelines', function () {
    const pipelines = {
      pizza:
  [{ stepOperation: 'Turn on the oven' },
    { stepOperation: 'Put there frozen pizza' },
    { stepOperation: 'Wait 30 min' },
    { stepOperation: 'Enjoy!' }],
      pancakes:
  [{ stepOperation: 'Find a French chef' },
    { stepOperation: 'Ask them to make you pancakes' }],
    }
    const operation2properties = {
      'Find a French chef': ['quickly'],
      'Ask them to make you pancakes': null,
      'Turn on the oven': null,
      'Put there frozen pizza': null,
      'Wait 30 min': null,
      'Enjoy!': ['with friends'],
    }
    const expectedPizzaIssue = validators.pipelinePropertiesExist.validate('pizza', [])
    const expectedPancakesIssue = validators.pipelinePropertiesExist.validate('pancakes', [])

    it('should issue a warning if pipeline has no readable/writable property', function () {
      const pipeline2properties = {
        pancakes: ['Pipeline'],
        pizza: ['Pipeline', 'crunchy'],
      }
      checks = new ChecksCollection()

      parser.validatePipelines(pipelines, operation2properties, pipeline2properties, checks)
      const actualPizzaIssues = checks.getPipelineChecks('pizza', 'warning')
      const actualPancakesIssues = checks.getPipelineChecks('pancakes', 'warning')

      assert(checkArrayContainsObject(actualPizzaIssues, expectedPizzaIssue))
      assert(checkArrayContainsObject(actualPancakesIssues, expectedPancakesIssue))
    })

    it('should issue an info if pipeline has readable/writable property', function () {
      const pipeline2properties = {
        pancakes: ['soft', 'Readable'],
        pizza: ['crunchy', 'Writable'],
      }

      for (const pipelineID of ['pizza', 'pancakes']) {
        checks = new ChecksCollection()

        const expectedIssue = validators.pipelinePropertiesExist.validate(pipelineID, ['Readable'])
        parser.validatePipelines({ [pipelineID]: pipelines[pipelineID] }, operation2properties, pipeline2properties, checks)
        assert(checkArrayContainsObject(checks.pipelines[pipelineID], expectedIssue))
      }
    })

    it('should check pipeline metadata for a pipeline with no steps', function () {
      parser.validatePipelines({ empty: [] }, {}, {}, checks)

      assert.deepStrictEqual(checks.getPipelineChecks('empty'), [
        validators.pipelinePropertiesExist.validate('empty', []),
      ])
    })

    it('should use nested step metadata to check the containing pipeline', function () {
      const pipelines = {
        main: [{ stepOperation: 'nested', stepProperties: ['Operation', 'Readable'] }],
      }

      parser.validatePipelines(pipelines, { nested: null }, { main: ['Pipeline'] }, checks)

      assert.deepStrictEqual(checks.getPipelineChecks('main'), [
        validators.pipelinePropertiesMatchLastStrict.validate('main', ['Pipeline'], 'Readable'),
        validators.pipelinePropertiesExist.validate('main', ['Pipeline']),
      ])
    })
  })
})
