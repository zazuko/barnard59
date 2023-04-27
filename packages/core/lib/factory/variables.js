import $rdf from 'rdf-ext'
import ns from '../namespaces.js'
import { VariableMap } from '../VariableMap.js'

const FALSE = $rdf.literal('false', ns.xsd.boolean)

async function createVariables (ptr, { basePath, context, loaderRegistry, logger }) {
  const variables = new VariableMap()

  for (const variablePtr of ptr.out(ns.p.variable).toArray()) {
    let variable
    if (variablePtr.out(ns.p.value).term) {
      variable = await loaderRegistry.load(variablePtr, { basePath, context, logger, variables })

      if (!variable) {
        throw new Error(`Failed to load variable ${variablePtr.value}`)
      }
    }

    const optional = variablePtr.out(ns.p.required).term?.equals(FALSE) || false
    variables.set(variablePtr.out(ns.p.name).value, variable?.value, { optional })
  }

  return variables
}

export default createVariables
