import { strictEqual } from 'node:assert'
import ParsingClient from 'sparql-http-client/ParsingClient.js'
import { upAll } from 'docker-compose/dist/v2.js'
import waitOn from 'wait-on'
import { pipelineDefinitionLoader } from 'barnard59-test-support/loadPipelineDefinition.js'
import env from 'barnard59-env/index.ts'
import { createPipeline } from 'barnard59-core/index.ts'
import getStream from 'get-stream'
import { CONSTRUCT, SELECT } from '@tpluscode/sparql-builder'
import { fromRdf } from 'rdf-literal'

const support = (new URL('./support', import.meta.url)).pathname

const loadPipelineDefinition = pipelineDefinitionLoader(import.meta.url, '../')

const user = 'admin'
const password = 'admin'
const endpoint = 'http://localhost:3030/test'

describe('graph-store pipeline', function () {
  before(async function () {
    this.timeout(100000)
    await upAll({
      cwd: support,
    })
    await waitOn({
      resources: ['http://localhost:3030'],
    })
  })

  const graph = 'http://example.org/'
  const client = new ParsingClient({
    factory: env,
    endpointUrl: endpoint + '/query',
    updateUrl: endpoint + '/update',
    user,
    password,
  })

  it('should run graph-store put pipeline without error', async () => {
    const data = `${support}/data.ttl`
    const { ptr, basePath } = await loadPipelineDefinition('pipeline/put', {
      term: env.namedNode('https://barnard59.zazuko.com/pipeline/graph-store/put'),
    })
    const pipeline = createPipeline(ptr, {
      env,
      basePath,
      variables: new Map([
        ['endpoint', endpoint],
        ['user', user],
        ['password', password],
        ['graph', graph],
        ['source', data],
      ]),
    })

    await getStream(pipeline.stream)

    const storedData = await CONSTRUCT`?s ?p ?o`
      .FROM(env.namedNode(graph))
      .WHERE`?s ?p ?o`
      .execute(client)
    const expectedData = await env.dataset().import(env.fromFile(data))
    strictEqual(storedData.toCanonical(), expectedData.toCanonical())
  })

  context('given large dataset', () => {
    const graph = 'http://example.org/large-graph'

    beforeEach(async function () {
      this.timeout(10000)
      await client.query.update(`DROP GRAPH <${graph}>`)
    });

    [1000, 10000, 100000].forEach((size) => {
      context(`with ${size} triples`, () => {
        it('should complete graph store operation in a timely manner', async function () {
          this.timeout(10000)

          // given`
          const { ptr, basePath } = await loadPipelineDefinition('test/support/pipelines/large-dataset')
          const pipeline = createPipeline(ptr, {
            env,
            basePath,
            variables: new Map([
              ['endpoint', endpoint],
              ['user', user],
              ['password', password],
              ['graph', graph],
              ['triple-count', size],
            ]),
          })

          // when
          await getStream(pipeline.stream)

          // then
          const [{ count }] = await SELECT`(count(*) as ?count)`
            .FROM(env.namedNode(graph))
            .WHERE`?s ?p ?o`
            .execute(client)
          strictEqual(fromRdf(count), size)
        })
      })
    })
  })
})
