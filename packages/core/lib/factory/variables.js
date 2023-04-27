import ns from '../namespaces.js'

async function createVariables (ptr, { basePath, context, loaderRegistry, logger }) {
  const variables = new Map()

  for (const variablePtr of ptr.out(ns.p.variable).toArray().filter(withValue)) {
    const variable = await loaderRegistry.load(variablePtr, { basePath, context, logger, variables })

    if (!variable) {
      throw new Error(`Failed to load variable ${variablePtr.value}`)
    }

    variables.set(variable.name, variable.value)
  }

  return variables
}

function withValue(variable) {
  return !!variable.out(ns.p.value).term
}

export default createVariables
