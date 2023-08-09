import program from 'commander'
import runAction from './cli/runAction.js'
import * as monitoringOptions from './cli/monitoringOptions.js'
import * as commonOptions from './cli/commonOptions.js'

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
  .action(runAction)

export default async function () {
  runCommand
    .addOption(commonOptions.variable)
    .addOption(commonOptions.variableAll)
    .addOption(commonOptions.verbose)

  await program.parseAsync(process.argv)
}
