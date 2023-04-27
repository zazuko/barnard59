import ns from '../namespaces.js'

async function createOperation(ptr, { basePath, context, loaderRegistry, logger, variables }) {
  const result = await loaderRegistry.load(ptr, { basePath, context, loaderRegistry, logger, variables })

  if (typeof result !== 'function') {
    const links = ptr.out(ns.code.link).values.join(', ')

    throw new Error(`Failed to load operation ${ptr.value} (${links})`)
  }

  return result
}

export default createOperation
