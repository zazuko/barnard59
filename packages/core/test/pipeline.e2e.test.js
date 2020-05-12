const { deepStrictEqual } = require('assert')
const { beforeEach, describe, it } = require('mocha')
const nock = require('nock')
const Pipeline = require('../lib/pipelineFactory')
const asyncLoaders = require('./support/asyncLoaders')
const load = require('./support/load-pipeline')
const run = require('./support/run')

const dateTimeLd = {
  '@context': {
    date: 'http://purl.org/dc/elements/1.1/date'
  },
  '@id': 'http://worldtimeapi.org/api/timezone/CET',
  date: '2019-03-07T12:58:54.094127+01:00'
}

const dateTime = {
  datetime: '2019-03-07T12:58:54.094127+01:00'
}

describe('Pipeline', () => {
  beforeEach(() => {
    nock('http://worldtimeapi.org')
      .get('/api/timezone/CET')
      .reply(200, dateTime)
  })

  it('should load code using node: scheme', async () => {
    // given
    const definition = await load('e2e/world-clock-node.ttl')
    const pipe = Pipeline(definition, 'http://example.org/pipeline/')

    // when
    const out = await run(pipe)

    // then
    deepStrictEqual(JSON.parse(out), dateTimeLd)
  })

  it('should load code using file: scheme', async () => {
    // given
    const definition = await load('e2e/world-clock-file.ttl')
    const pipe = Pipeline(definition, 'http://example.org/pipeline/')

    // when
    const out = await run(pipe)

    // then
    deepStrictEqual(JSON.parse(out), dateTimeLd)
  })

  it('should load code using async loaders', async () => {
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
    deepStrictEqual(JSON.parse(out), { abc: 'dfg' })
  })
})
