import * as url from 'url'
import { expect } from 'chai'
import env from 'barnard59-env'
import express from 'express'
import withServer from 'express-as-promise/withServer.js'
import { turtle } from '@tpluscode/rdf-string'
import toStream from 'string-to-stream'
import { createPipeline } from 'barnard59-core'
import { pipelineDefinitionLoader } from 'barnard59-test-support/loadPipelineDefinition.js'
import getStream from 'get-stream'

const ex = env.namespace('http://example.org/')
const ns = env.namespace('https://barnard59.zazuko.com/pipeline/shacl/')

const loadPipeline = pipelineDefinitionLoader(import.meta.url, '../../pipeline')

describe('pipeline/validate', function () {
  it('runs without error when input is valid', async () => {
    // given
    const data = turtle`
      ${ex.Person}
        a ${env.ns.schema.Person} ;
        ${env.ns.schema.name} "John Doe" ;
      .
    `.toString()
    const { ptr, basePath } = await loadPipeline('validate', {
      term: ns._validate,
    })
    const variables = new Map([
      ['shapes', url.fileURLToPath(new URL('../support/PersonShape.ttl', import.meta.url))],
    ])
    const pipeline = createPipeline(ptr, { basePath, env, variables })

    // when
    const output = await getStream(toStream(data).pipe(pipeline.stream))

    // then
    expect(output).to.match(/conforms> "true"/)
  })

  it('validates against shapes from input', async () => {
    // given
    const data = turtle`
      ${ex.Person}
        a ${env.ns.schema.Person} ;
        ${env.ns.schema.name} "John Doe" ;
      .
      
      []
        a ${env.ns.sh.NodeShape} ;
        ${env.ns.sh.targetClass} ${env.ns.schema.Person} ;
        ${env.ns.sh.property} [
          a ${env.ns.sh.PropertyShape} ;
          ${env.ns.sh.path} ${env.ns.schema.name} ;
          ${env.ns.sh.hasValue} "Jane Doe" ;
        ] ;
      .
    `.toString()
    const { ptr, basePath } = await loadPipeline('validate', {
      term: ns._validate,
    })
    const pipeline = createPipeline(ptr, { basePath, env })

    // when
    const output = await getStream(toStream(data).pipe(pipeline.stream))

    // then
    expect(output).to.match(/conforms> "false"/)
  })

  it('validates against remote shapes', () => {
    return withServer(async server => {
      server.app.use(express.static(url.fileURLToPath(new URL('../support', import.meta.url))))
      const baseUrl = await server.listen()

      // given
      const data = turtle`
      ${ex.Person}
        a ${env.ns.schema.Person} ;
        ${env.ns.schema.name} "John Doe" ;
      .
    `.toString()
      const { ptr, basePath } = await loadPipeline('validate', {
        term: ns._validate,
      })
      const variables = new Map([
        ['shapes', new URL('PersonShape.ttl', baseUrl).toString()],
      ])
      const pipeline = createPipeline(ptr, { basePath, env, variables })

      // when
      const output = await getStream(toStream(data).pipe(pipeline.stream))

      // then
      expect(output).to.match(/conforms> "true"/)
    })
  })

  it('pushes error reports when resource has errors', async () => {
    // given
    const data = turtle`
      ${ex.Person}
        a ${env.ns.schema.Person} ;
        ${env.ns.schema.name} "" ;
      .
    `.toString()
    const { ptr, basePath } = await loadPipeline('validate', {
      term: ns._validate,
    })
    const variables = new Map([
      ['shapes', url.fileURLToPath(new URL('../support/PersonShape.ttl', import.meta.url))],
    ])
    const pipeline = createPipeline(ptr, { basePath, env, variables })

    // when
    const output = await getStream(toStream(data).pipe(pipeline.stream))

    // then
    expect(output).to.contain(env.ns.sh.MinLengthConstraintComponent.value)
  })
})
