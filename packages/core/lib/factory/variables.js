import { VariableMap } from '../VariableMap.js'

async function createVariables(ptr, { basePath, context, loaderRegistry, logger }) {
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
    variables.set(variablePtr.out(context.env.ns.p.name).value, variable?.value, { optional })
  }

  return variables
}

export default createVariables
