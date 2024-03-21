import { strictEqual } from 'node:assert'
import ParsingClient from 'sparql-http-client/ParsingClient.js'
import * as compose from 'docker-compose'
import waitOn from 'wait-on'
import { pipelineDefinitionLoader } from 'barnard59-test-support/loadPipelineDefinition.js'
import env from 'barnard59-env/index.ts'
import { createPipeline } from 'barnard59-core/index.ts'
import getStream from 'get-stream'

const support = (new URL('./support', import.meta.url)).pathname

const loadPipelineDefinition = pipelineDefinitionLoader(import.meta.url, '../pipeline')

const user = 'admin'
const password = 'admin'
const endpoint = 'http://localhost:3030/test'

describe('graph-store pipeline', function () {
  before(async function () {
    this.timeout(100000)
    await compose.upAll({
      cwd: support,
    })
    await waitOn({
      resources: ['http://localhost:3030'],
    })
  })

  const graph = 'http://example.org/'

  const selectAll = () => {
    const client = new ParsingClient({
      factory: env,
      endpointUrl: endpoint + '/query',
      user,
      password,
    })
    return client.query.construct('CONSTRUCT { ?s ?p ?o } WHERE { ?s ?p ?o }')
  }

  it('should run graph-store put pipeline without error', async () => {
    const data = `${support}/data.ttl`
    const { ptr, basePath } = await loadPipelineDefinition('put', {
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

    const storedData = await selectAll()
    const expectedData = await env.dataset().import(env.fromFile(data))
    strictEqual(storedData.toCanonical(), expectedData.toCanonical())
  })
})
