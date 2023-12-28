import { program } from 'commander'
import isInstalledGlobally from 'is-installed-globally'
import { MultipleRootsError } from '../findPipeline.js'
import runAction from './cli/runAction.js'
import * as monitoringOptions from './cli/monitoringOptions.js'
import * as commonOptions from './cli/commonOptions.js'
import { discoverCommands } from './cli/dynamicCommands.js'
import discoverManifests from './discoverManifests.js'
import { parse } from './pipeline.js'
import { combine } from './cli/options.js'

program
  .name('barnard59')
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

  return {
    program,
    async run() {
      program.exitOverride()

      try {
        await program.parseAsync(process.argv)
      } catch (error) {
        if (error instanceof program.CommanderError) {
          const { groups } = /unknown command '(?<command>[^']+)'/.exec(error.message) || {}
          if (groups && groups.command) {
            /* eslint-disable no-console */
            if (isInstalledGlobally) {
              console.error(`Try running 'npm install (-g) barnard59-${groups.command}'`)
            }

            console.error(`Try running 'npm install barnard59-${groups.command}'`)
          }
          process.exit(error.exitCode)
        } else if (error instanceof MultipleRootsError) {
          const alternatives = error.alternatives.map(x => `\n\t--pipeline ${x}`).join('')
          // eslint-disable-next-line no-console
          console.error(`Multiple root pipelines found. Try one of these:${alternatives}`)
          process.exit(1)
        } else {
          throw error
        }
      }
    },
  }
}
