import { strictEqual } from 'assert'
import shell from 'shelljs'
import ParsingClient from 'sparql-http-client/ParsingClient.js'
import * as compose from 'docker-compose'
import waitOn from 'wait-on'

const support = (new URL('./support', import.meta.url)).pathname
const cwd = new URL('..', import.meta.url).pathname

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

  const selectAll = async () => {
    const client = new ParsingClient({
      endpointUrl: endpoint + '/query',
      user,
      password,
    })
    const response = await client.query.select('SELECT * WHERE { ?s ?p ?o }')
    return response
  }

  it.only('should run graph-store put pipeline without error', async () => {
    this.timeout(10000)
    const data = `${support}/data.ttl`
    const command = `barnard59 graph-store put --endpoint ${endpoint} --user ${user} --password ${password} --graph ${graph} --source ${data}`
    const result = shell.exec(command, { silent: true, cwd })

    strictEqual(result.code, 0)

    const storedData = await selectAll()
    strictEqual(storedData.length, 1)
  })
})
