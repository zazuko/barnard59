import program from 'commander'
import runAction from './cli/runAction.js'
import * as otelOptions from './cli/otelOptions.js'
import * as commonOptions from './cli/commonOptions.js'

program
  .addOption(commonOptions.variable)
  .addOption(commonOptions.variableAll)
  .addOption(commonOptions.verbose)
  .addOption(commonOptions.enableBufferMonitor)
  .addOption(otelOptions.debug)
  .addOption(otelOptions.metricsExporter)
  .addOption(otelOptions.metricsInterval)
  .addOption(otelOptions.tracesExporter)

program
  .command('run <filename>')
  .option('--output [filename]', 'output file', '-')
  .option('--pipeline [iri]', 'IRI of the pipeline description')
  .action(runAction)

export default async function () {
  await program.parseAsync(process.argv)
}
