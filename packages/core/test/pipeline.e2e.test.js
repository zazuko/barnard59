/* global describe, test */
const expect = require('expect')
const Pipeline = require('../lib/pipelineFactory')
const load = require('./support/load-pipeline')
const run = require('../lib/run')
const asyncLoaders = require('./support/asyncLoaders')

describe('Pipeline', () => {
  test('can load code using node: scheme', async () => {
    // given
    const definition = await load('e2e/world-clock-node.ttl')
    const pipe = Pipeline(definition)
    let out = ''
    pipe.on('data', (chunk) => {
      out += chunk
    })

    // when
    await run(pipe)

    // then
    const outJson = JSON.parse(out)
    expect(outJson).toContainKey('date')
    expect(outJson).toContainValue('http://worldclockapi.com/api/json/cet/now')
  })

  test('can load code using file: scheme', async () => {
    // given
    const definition = await load('e2e/world-clock-file.ttl')
    const pipe = Pipeline(definition)
    let out = ''
    pipe.on('data', (chunk) => {
      out += chunk
    })

    // when
    await run(pipe)

    // then
    const outJson = JSON.parse(out)
    expect(outJson).toContainKey('date')
    expect(outJson).toContainValue('http://worldclockapi.com/api/json/cet/now')
  })

  test('can load code using async loaders', async () => {
    // given
    const definition = await load('e2e/world-clock-async.ttl')
    const pipe = Pipeline(definition, {
      additionalLoaders: [
        asyncLoaders.promisedUrl,
        asyncLoaders.promiseWrapper
      ]
    })
    let out = ''
    pipe.on('data', (chunk) => {
      out += chunk
    })

    // when
    await run(pipe)

    // then
    const outJson = JSON.parse(out)
    expect(outJson).toContainKey('@context')
    expect(outJson).toContainKey('date')
  })
})
