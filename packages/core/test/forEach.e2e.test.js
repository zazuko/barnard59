/* global describe, test */
const expect = require('expect')
const path = require('path')
const Pipeline = require('../lib/pipelineFactory')
const load = require('./support/load-pipeline')
const run = require('./support/run')

describe('forEach', () => {
  test('executes example correctly', async () => {
    // given
    const definition = await load('../../examples/forEach.ttl')
    const pipe = Pipeline(definition, 'http://example.org/pipeline#pipeline', {
      basePath: path.resolve('examples')
    })

    // when
    const out = await run(pipe)

    // then
    const outJson = JSON.parse(out)
    expect(outJson.length).toBe(8)
  })

  /*
  * This pipeline verifies that a variable can be imperatively
  * added during pipeline execution of a forEach step
  * */
  test('variables set in forEach are preserved during execution', async () => {
    // given
    const definition = await load('/e2e/foreach-with-handler.ttl')
    const pipe = Pipeline(definition, 'http://example.org/pipeline/', {
      basePath: path.resolve('test'),
      objectMode: true
    })

    // when
    const out = await run(pipe, 0)

    // then
    expect(out).toBeGreaterThan(0)
  })
})
