import { strictEqual } from 'node:assert'
import { pipelineDefinitionLoader } from 'barnard59-test-support/loadPipelineDefinition.js'
import env from 'barnard59-env'
import defaultLoaderRegistry from '../../lib/defaultLoaderRegistry.js'
import createOperation from '../../lib/factory/operation.js'
import ns from '../support/namespaces.js'
import argsToStream from '../support/operations/argsToStream.js'

const loadPipelineDefinition = pipelineDefinitionLoader(import.meta.url, '../support/definitions')
const context = { env }

describe('factory/operation', () => {
  it('should be a method', () => {
    strictEqual(typeof createOperation, 'function')
  })

  it('should load the given operation', async () => {
    const { ptr: definition, basePath } = await loadPipelineDefinition('plain')
    const ptr = [...definition.node(ns.ex('')).out(ns.p.steps).out(ns.p.stepList).list()][0].out(ns.code.implementedBy)

    const operation = await createOperation(ptr, {
      context,
      basePath,
      loaderRegistry: defaultLoaderRegistry(env),
    })

    strictEqual(operation, argsToStream)
  })
})
