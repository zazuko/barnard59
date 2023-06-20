import { deepStrictEqual } from 'assert'
import getStream from 'get-stream'
import { beforeEach, describe, it } from 'mocha'
import nock from 'nock'
import defaultLoaderRegistry from '../lib/defaultLoaderRegistry.js'
import createPipeline from '../lib/factory/pipeline.js'
import { promisedEcmaScriptLoader, promisedUrlLoader } from './support/asyncLoaders.js'
import loadPipelineDefinition from './support/loadPipelineDefinition.js'

const dateTimeLd = {
  '@context': {
    date: 'http://purl.org/dc/elements/1.1/date',
  },
  '@id': 'http://worldtimeapi.org/api/timezone/CET',
  date: '2019-03-07T12:58:54.094127+01:00',
}

const dateTime = {
  datetime: '2019-03-07T12:58:54.094127+01:00',
}

describe('Pipeline', () => {
  beforeEach(() => {
    nock('http://worldtimeapi.org')
      .get('/api/timezone/CET')
      .reply(200, dateTime)
  })

  it('should load code using node: scheme', async () => {
    const ptr = await loadPipelineDefinition('e2e/world-clock-node')
    const pipeline = await createPipeline(ptr)

    const out = await getStream(pipeline.stream)

    deepStrictEqual(JSON.parse(out), dateTimeLd)
  })

  it('should load code using file: scheme', async () => {
    const ptr = await loadPipelineDefinition('e2e/world-clock-file')
    const pipeline = await createPipeline(ptr, { basePath: process.cwd() })

    const out = await getStream(pipeline.stream)

    deepStrictEqual(JSON.parse(out), dateTimeLd)
  })

  it('should load code using async loaders', async () => {
    const ptr = await loadPipelineDefinition('e2e/world-clock-async')
    const loaderRegistry = defaultLoaderRegistry()

    promisedEcmaScriptLoader.register(loaderRegistry)
    promisedUrlLoader.register(loaderRegistry)

    const pipeline = await createPipeline(ptr, { loaderRegistry })

    const out = await getStream(pipeline.stream)

    deepStrictEqual(JSON.parse(out), dateTimeLd)
  })
})
