import createArguments from './arguments.js'
import createOperation from './operation.js'
import { isStream } from '../isStream.js'
import ns from '../namespaces.js'
import Step from '../Step.js'

async function createStep (ptr, { basePath, context, loaderRegistry, logger, variables }) {
  const args = await createArguments(ptr, { basePath, context, loaderRegistry, logger, variables })
  const operation = await createOperation(ptr.out(ns.code.implementedBy), { basePath, context, loaderRegistry, logger, variables })
  const stream = await operation.apply(context, args)

  if (!stream || !isStream(stream)) {
    throw new Error(`${ptr.value} didn't return a stream`)
  }

  return new Step({ args, basePath, context, loaderRegistry, logger, operation, ptr, stream, variables })
}

export default createStep
