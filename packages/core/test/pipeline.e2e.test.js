const expect = require('expect')
const Pipeline = require('../lib/pipelineFactory')
const load = require('./support/load-pipeline')
const run = require('./support/run')
const asyncLoaders = require('./support/asyncLoaders')
const fetch = require('jest-fetch-mock')

jest.setMock('node-fetch', fetch)

describe('Pipeline', () => {
  beforeEach(() => {
    fetch.resetMocks()

    const dateTime = {
      'datetime': '2019-03-07T12:58:54.094127+01:00'
    }

    fetch.mockResponse(JSON.stringify(dateTime))
  })

  test('can load code using node: scheme', async () => {
    // given
    const definition = await load('e2e/world-clock-node.ttl')
    const pipe = Pipeline(definition, 'http://example.org/pipeline/')

    // when
    const out = await run(pipe)

    // then
    const outJson = JSON.parse(out)
    expect(outJson).toContainKey('date')
    expect(outJson).toContainValue('http://worldtimeapi.org/api/timezone/CET')
  })

  test('can load code using file: scheme', async () => {
    // given
    const definition = await load('e2e/world-clock-file.ttl')
    const pipe = Pipeline(definition, 'http://example.org/pipeline/')

    // when
    const out = await run(pipe)

    // then
    const outJson = JSON.parse(out)
    expect(outJson).toContainKey('date')
    expect(outJson).toContainValue('http://worldtimeapi.org/api/timezone/CET')
  })

  test('can load code using async loaders', async () => {
    // given
    const definition = await load('e2e/world-clock-async.ttl')
    const pipe = Pipeline(definition, 'http://example.org/pipeline/', {
      additionalLoaders: [
        asyncLoaders.promisedUrl,
        asyncLoaders.ecmaScriptLoaderWrapper
      ]
    })

    // when
    const out = await run(pipe)

    // then
    const outJson = JSON.parse(out)
    expect(outJson).toContainKey('@context')
    expect(outJson).toContainKey('date')
  })
})
