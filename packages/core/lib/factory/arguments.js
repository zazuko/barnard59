import parseArguments from 'rdf-loader-code/arguments.js'
import { unknownVariable } from '../loader/variable.js'
import ns from '../namespaces.js'

async function createArguments (ptr, { basePath, context, loaderRegistry, logger, variables }) {
  const args = await parseArguments(ptr, { basePath, context, loaderRegistry, logger, variables })

  // The variable loader returns the symbol unknownVariable for all unknown variables.
  // This code maps the unknownVariable symbols to undefined for both kinds of arguments:

  // list
  if (ptr.out(ns.code.arguments).isList()) {
    return args.map(arg => arg === unknownVariable ? undefined : arg)
  }

  // key/value pairs
  for (const [key, value] of Object.entries(args[0])) {
    if (value === unknownVariable) {
      args[0][key] = undefined
    }
  }

  return args
}

export default createArguments
