import * as url from 'url'
import { expect } from 'chai'
import env from 'barnard59-env'
import { turtle } from '@tpluscode/rdf-string'
import toStream from 'string-to-stream'
import { createPipeline } from 'barnard59-core'
import { pipelineDefinitionLoader } from 'barnard59-test-support/loadPipelineDefinition.js'
import getStream from 'get-stream'

const ex = env.namespace('http://example.org/')
const ns = env.namespace('https://barnard59.zazuko.com/pipeline/n3-rules/')

const loadPipeline = pipelineDefinitionLoader(import.meta.url, '../../pipeline')

describe('pipeline/apply', function () {
  it('runs deriving triple', async () => {
    // given
    const data = turtle`
      ${ex.Person}
        a ${env.ns.schema.Person} ;
        ${env.ns.schema.name} "John Doe" ;
      .
    `.toString()
    const { ptr, basePath } = await loadPipeline('applyRules', {
      term: ns._apply,
    })
    const variables = new Map([
      ['rules', url.fileURLToPath(new URL('../support/PersonRules.n3', import.meta.url))],
      ['include', ''],
    ])
    const pipeline = createPipeline(ptr, { basePath, env, variables })

    // when
    const output = await getStream(toStream(data).pipe(pipeline.stream))

    // then
    expect(output).to.equal('<http://example.org/Person> <http://xmlns.com/foaf/0.1/name> "John Doe" .\n')
  })

  it('runs deriving triple and passing input', async () => {
    // given
    const data = turtle`
      ${ex.Person}
        a ${env.ns.schema.Person} ;
        ${env.ns.schema.name} "John Doe" ;
      .
    `.toString()
    const { ptr, basePath } = await loadPipeline('applyRules', {
      term: ns._apply,
    })
    const variables = new Map([
      ['rules', url.fileURLToPath(new URL('../support/PersonRules.n3', import.meta.url))],
      ['include', 'all'],
    ])
    const pipeline = createPipeline(ptr, { basePath, env, variables })

    // when
    const output = await getStream(toStream(data).pipe(pipeline.stream))

    // then
    expect(output).to.equal(`<http://example.org/Person> <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <http://schema.org/Person> .
<http://example.org/Person> <http://schema.org/name> "John Doe" .
<http://example.org/Person> <http://xmlns.com/foaf/0.1/name> "John Doe" .
`)
  })
})
