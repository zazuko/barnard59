import { deepStrictEqual } from 'assert'
import getStream from 'get-stream'
import nock from 'nock'
import createPipeline from 'barnard59-core/lib/factory/pipeline.js'
import defaultLoaderRegistry from 'barnard59-core/lib/defaultLoaderRegistry.js'
import { pipelineDefinitionLoader } from 'barnard59-test-support/loadPipelineDefinition.js'
import { expect } from 'chai'
import toCanonical from 'rdf-dataset-ext/toCanonical.js'
import fromStream from 'rdf-dataset-ext/fromStream.js'
import fromFile from 'rdf-utils-fs/fromFile.js'
import env from 'barnard59-env'
import { promisedEcmaScriptLoader, promisedUrlLoader } from './asyncLoaders.js'

const loadPipelineDefinition = pipelineDefinitionLoader(import.meta.url, 'definitions')

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
    const ptr = await loadPipelineDefinition('world-clock/node')
    const pipeline = await createPipeline(ptr, { env })

    const out = await getStream(pipeline.stream)

    deepStrictEqual(JSON.parse(out), dateTimeLd)
  })

  it('should load code using file: scheme', async () => {
    const ptr = await loadPipelineDefinition('world-clock/file')
    const pipeline = await createPipeline(ptr, { env, basePath: process.cwd() })

    const out = await getStream(pipeline.stream)

    deepStrictEqual(JSON.parse(out), dateTimeLd)
  })

  it('should load code using async loaders', async () => {
    const ptr = await loadPipelineDefinition('world-clock/async')
    const loaderRegistry = defaultLoaderRegistry(env)

    promisedEcmaScriptLoader.register(loaderRegistry)
    promisedUrlLoader.register(loaderRegistry)

    const pipeline = await createPipeline(ptr, { env, loaderRegistry })

    const out = await getStream(pipeline.stream)

    deepStrictEqual(JSON.parse(out), dateTimeLd)
  })

  it('should load file contents using loader', async () => {
    // given
    const ptr = await loadPipelineDefinition('file-loader')
    const pipeline = await createPipeline(ptr, {
      env,
      basePath: process.cwd(),
    })

    // when
    const out = await fromStream(env.dataset(), env.formats.parsers.import('text/turtle', pipeline.stream))

    // then
    const source = await fromStream(env.dataset(), fromFile('definitions/file-loader.ttl'))
    expect(toCanonical(out)).to.eq(toCanonical(source))
  })

  it('should be set to fail from sub-pipeline', async () => {
    // given
    const ptr = await loadPipelineDefinition('sub-pipeline-error')
    const pipeline = await createPipeline(ptr, {
      env,
      basePath: process.cwd(),
    })

    // when
    const out = await getStream(pipeline.stream)

    // then
    expect(out).to.eq('foobar')
    expect(pipeline.error).to.be.instanceof(Error)
    expect(pipeline.error.message).to.eq('foo')
  })

  it('works with async generator steps', async () => {
    // given
    const ptr = await loadPipelineDefinition('limit-offset')
    const pipeline = await createPipeline(ptr, {
      env,
      basePath: process.cwd(),
    })

    // when
    const out = await getStream.array(pipeline.stream)

    // then
    expect(out).to.deep.eq([{ age: 23 }])
  })
})
