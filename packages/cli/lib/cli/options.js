import { program } from 'commander'
import { defaultLogger } from 'barnard59-core'

export function combine({ variable: commandVars, ...options }) {
  const { variable: programVars, ...programOpts } = program.opts()
  const combinedOptions = {
    ...programOpts,
    ...options,
  }
  const { variableAll, quiet } = combinedOptions
  const variables = new Map([
    ...programVars.entries(),
    ...commandVars.entries(),
  ])
  const verbose = Math.max(programOpts.verbose, options.verbose)
  const level = ['warn', 'info', 'debug', 'verbose', 'trace'][verbose] || 'warn'

  if (variableAll) {
    for (const [key, value] of Object.entries(process.env)) {
      if (!variables.has(key)) {
        variables.set(key, value)
      }
    }
  }

  return {
    logger: defaultLogger({ level, quiet }),
    ...combinedOptions,
    variables,
    level,
  }
}
