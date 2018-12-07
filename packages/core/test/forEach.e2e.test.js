/* global describe, test */
const expect = require('expect')
const path = require('path')
const Pipeline = require('../lib/pipelineFactory')
const load = require('./support/load-pipeline')
const run = require('./support/pipelineToString')

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
})
