// eslint-disable-next-line import/no-extraneous-dependencies
import { generateCompletionSpec } from '@fig/complete-commander'
import cli from '../lib/cli.js'

(async () => {
  const { program } = await cli()
  process.stdout.write(await generateCompletionSpec(program) || '# Failed to generate completion spec\n')
})()
