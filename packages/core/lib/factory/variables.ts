import type { MultiPointer } from 'clownface'
import type { Logger } from 'winston'
import type { LoaderRegistry } from 'rdf-loaders-registry'
import { isGraphPointer } from 'is-graph-pointer'
import { VariableMap } from '../VariableMap.js'
import type { Context } from '../../index.js'

async function createVariables(ptr: MultiPointer, { basePath, context, loaderRegistry, logger }: { basePath: string; context: Pick<Context, 'env'>; loaderRegistry: LoaderRegistry; logger: Logger }) {
  const variables = new VariableMap()

  for (const variablePtr of ptr.out(context.env.ns.p.variable).toArray()) {
    let variable
    if (variablePtr.out(context.env.ns.p.value).term) {
      variable = await loaderRegistry.load(variablePtr, { basePath, context, logger, variables })

      if (!variable) {
        throw new Error(`Failed to load variable ${variablePtr.value}`)
      }
    }

    const optional = variablePtr.out(context.env.ns.p.required).term?.equals(context.env.FALSE) || false
    const variableName = variablePtr.out(context.env.ns.p.name)
    if (!isGraphPointer(variableName)) {
      throw new Error(`Invalid variable name '${variableName.value}'`)
    }

    variables.set(variableName.value, variable?.value, { optional })
  }

  return variables
}

export default createVariables
