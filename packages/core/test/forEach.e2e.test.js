const { strictEqual } = require('assert')
const path = require('path')
const { describe, it } = require('mocha')
const Pipeline = require('../lib/pipelineFactory')
const load = require('./support/load-pipeline')
const run = require('./support/run')

describe('forEach', () => {
  it('should execute the example correctly', async () => {
    // given
    const definition = await load('../../examples/forEach.ttl')
    const pipe = Pipeline(definition, 'http://example.org/pipeline#pipeline', {
      basePath: path.resolve('examples')
    })

    // when
    const out = await run(pipe)

    // then
    const outJson = JSON.parse(out)
    strictEqual(outJson.length, 24)
  })

  /*
  * This pipeline verifies that a variable can be imperatively
  * added during pipeline execution of a forEach step
  * */
  it('should preserve variables set during forEach execution', async () => {
    // given
    const definition = await load('/e2e/foreach-with-handler.ttl')
    const pipe = Pipeline(definition, 'http://example.org/pipeline/', {
      basePath: path.resolve('test'),
      objectMode: true
    })

    // when
    const out = await run(pipe, [], (c, out) => {
      out.push(c)
      return out
    })

    // then
    strictEqual(out.length > 0, true)
    strictEqual(out[0] !== out[1], true)
  })
})
