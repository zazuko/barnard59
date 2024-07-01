import type { MultiPointer } from 'clownface'
import type { Logger } from 'winston'
import type { LoaderRegistry } from 'rdf-loaders-registry'
import { isGraphPointer } from 'is-graph-pointer'
import type { Stream } from 'readable-stream'
import type { Context, VariableMap } from '../../index.js'

export type Operation = (this: Context, ...args: unknown[]) => Promise<Stream | (() => AsyncGenerator)> | Stream | (() => AsyncGenerator)

async function createOperation(ptr: MultiPointer, { basePath, context, loaderRegistry, logger, variables }: { basePath: string; context: Pick<Context, 'env'>; loaderRegistry: LoaderRegistry; logger: Logger; variables: VariableMap }) {
  if (!isGraphPointer(ptr)) {
    throw new Error(`Expected a single node, got ${ptr.values.join(', ')}`)
  }

  const result = await loaderRegistry.load<Operation>(ptr, { basePath, context, loaderRegistry, logger, variables })

  if (typeof result !== 'function') {
    const links = ptr.out(context.env.ns.code.link).values.join(', ')

    throw new Error(`Failed to load operation ${ptr.value} (${links})`)
  }

  return result
}

export default createOperation
