import { program } from 'commander'
import runAction from './cli/runAction.js'
import * as monitoringOptions from './cli/monitoringOptions.js'
import * as commonOptions from './cli/commonOptions.js'
import { discoverCommands } from './cli/dynamicCommands.js'
import { parse } from './pipeline.js'

program
  .addOption(commonOptions.variable)
  .addOption(commonOptions.variableAll)
  .addOption(commonOptions.verbose)
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
    const { basePath, ptr } = await parse(filename, options.pipeline)
    return runAction(ptr, basePath, options)
  })

export default async function () {
  for await (const command of discoverCommands()) {
    command
      .addOption(commonOptions.variable)
      .addOption(commonOptions.variableAll)
      .addOption(commonOptions.verbose)
  }

  runCommand
    .addOption(commonOptions.variable)
    .addOption(commonOptions.variableAll)
    .addOption(commonOptions.verbose)

  await program.parseAsync(process.argv)
}
