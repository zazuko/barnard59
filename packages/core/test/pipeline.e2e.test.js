/* global describe, test */
const expect = require('expect')
const Pipeline = require('../lib/pipeline')
const load = require('./support/load-pipeline')
const run = require('../lib/run')

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
    expect(out).toContain('date')
    expect(out).toContain('http://worldclockapi.com/api/json/cet/now')
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
    expect(out).toContain('date')
    expect(out).toContain('http://worldclockapi.com/api/json/cet/now')
  })
})
