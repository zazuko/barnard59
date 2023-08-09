import { expect } from 'chai'
import { discoverCommands } from '../../../lib/cli/dynamicCommands.js'

describe('lib/cli/discoverCommands.js', () => {
  it('finds graph-store command', async () => {
    // given
    const commands = []

    // when
    for await (const discovered of discoverCommands()) {
      commands.push(discovered)
    }

    // then
    const graphStorePipelineCommands = commands
      .find(c => c.name() === 'graph-store')
      .commands
    expect(graphStorePipelineCommands.map((c) => c.name()))
      .to.contain.all.members(['put'])
  })
})
