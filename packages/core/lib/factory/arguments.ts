import parseArguments from 'rdf-loader-code/arguments.js'
import type { GraphPointer } from 'clownface'
import type { Logger } from 'winston'
import type { LoaderRegistry } from 'rdf-loaders-registry'
import { unknownVariable } from '../loader/variable.js'
import type { Context, VariableMap } from '../../index.js'

async function createArguments(ptr: GraphPointer, { basePath, context, loaderRegistry, variables }: { basePath: string; context: Pick<Context, 'env'>; loaderRegistry: LoaderRegistry; logger: Logger; variables: VariableMap }) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const args: any[] = await parseArguments(ptr, { basePath, context, loaderRegistry, variables })

  // The variable loader returns the symbol unknownVariable for all unknown variables.
  // This code maps the unknownVariable symbols to undefined for both kinds of arguments:

  // list
  if (ptr.out(context.env.ns.code.arguments).isList()) {
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
