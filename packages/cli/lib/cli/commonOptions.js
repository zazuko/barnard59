import { Option } from 'commander'

function setVariable(str, all) {
  let [key, value] = str.split('=', 2)

  if (typeof value === 'undefined') {
    value = process.env[key]
  }

  return all.set(key, value)
}

export const variable = new Option('--variable <name=value>', 'variable key value pairs')
  .default(new Map())
  .argParser(setVariable)

export const variableAll = new Option('--variable-all', 'Import all environment variables')

export const verbose = new Option('-v, --verbose', 'enable diagnostic console output')
  .default(0)
  .argParser((v, total) => ++total)

export const quiet = new Option('-q, --quiet', 'Disable all logging')
