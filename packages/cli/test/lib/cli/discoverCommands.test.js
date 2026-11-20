import { expect } from 'chai'
import rdf from 'barnard59-env'
import { discoverCommands } from '../../../lib/cli/dynamicCommands.js'
import discoverManifests from '../../../lib/discoverManifests.js'

describe('lib/cli/discoverCommands.js', function () {
  it('finds graph-store command', async function () {
    // given
    const commands = []

    // when
    for await (const discovered of discoverCommands(discoverManifests())) {
      commands.push(discovered)
    }

    // then
    expect(commands.map(c => c.name()))
      .to.contain.all.members(['put'])
  })

  it('lets a pipeline use its default when a boolean switch is omitted', async function () {
    // given
    let command
    const manifest = rdf.clownface()
      .blankNode()
      .addOut(rdf.ns.rdf.type, rdf.ns.b59.CliCommand)
      .addOut(rdf.ns.b59.command, 'bar')
      .addOut(rdf.ns.b59.source, 'barnard59/test/support/definitions/variable-with-value.ttl')
    const manifests = [{
      name: 'foo',
      version: '0.0.0',
      manifest,
    }]

    // when
    for await (const discovered of discoverCommands(manifests)) {
      command = discovered
    }
    let options
    command.exitOverride()
      .configureOutput({ writeErr: () => {} })
      .action((parsed) => {
        options = parsed
      })
    await command.parseAsync([], { from: 'user' })

    // then
    expect(command.options.find(option => option.long === '--flag'))
      .to.include({ flags: '--flag', mandatory: false })
    expect(options).to.have.property('abc', 'foobar')
    expect(options).not.to.have.own.property('flag')
  })
})
