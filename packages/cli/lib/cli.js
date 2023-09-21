import { program } from 'commander'
import runAction from './cli/runAction.js'
import * as monitoringOptions from './cli/monitoringOptions.js'
import * as commonOptions from './cli/commonOptions.js'
import { discoverCommands } from './cli/dynamicCommands.js'
import discoverManifests from './discoverManifests.js'
import { parse } from './pipeline.js'
import { combine } from './cli/options.js'

program
  .addOption(commonOptions.variable)
  .addOption(commonOptions.variableAll)
  .addOption(commonOptions.verbose)
  .addOption(commonOptions.quiet)
  .addOption(monitoringOptions.enableBufferMonitor)
  .addOption(monitoringOptions.debug)
  .addOption(monitoringOptions.metricsExporter)
  .addOption(monitoringOptions.metricsInterval)
  .addOption(monitoringOptions.tracesExporter)

const runCommand = program
  .command('run <filename>')
  .option('--output [filename]', 'output file', '-')
  .option('--pipeline [iri]', 'IRI of the pipeline description')
  .action(async (filename, options) => {
    const combinedOptions = combine(options)
    const { basePath, ptr } = await parse(filename, options.pipeline, combinedOptions)
    return runAction(ptr, basePath, combinedOptions)
  })

export default async function () {
  for await (const command of discoverCommands(discoverManifests())) {
    command
      .addOption(commonOptions.variable)
      .addOption(commonOptions.variableAll)
      .addOption(commonOptions.verbose)
  }

  runCommand
    .addOption(commonOptions.variable)
    .addOption(commonOptions.variableAll)
    .addOption(commonOptions.verbose)
    .addOption(commonOptions.quiet)

  await program.parseAsync(process.argv)
}
