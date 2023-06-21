import { strictEqual } from 'assert'
import { resolve } from 'path'
import { pipelineDefinitionLoader } from 'barnard59-test-support/loadPipelineDefinition.js'
import defaultLoaderRegistry from '../../lib/defaultLoaderRegistry.js'
import createOperation from '../../lib/factory/operation.js'
import ns from '../support/namespaces.js'
import argsToStream from '../support/operations/argsToStream.js'

const loadPipelineDefinition = pipelineDefinitionLoader(import.meta.url, '../support/definitions')

describe('factory/operation', () => {
  it('should be a method', () => {
    strictEqual(typeof createOperation, 'function')
  })

  it('should load the given operation', async () => {
    const definition = await loadPipelineDefinition('plain')
    const ptr = [...definition.node(ns.ex('')).out(ns.p.steps).out(ns.p.stepList).list()][0].out(ns.code.implementedBy)

    const operation = await createOperation(ptr, {
      basePath: resolve('test'),
      loaderRegistry: defaultLoaderRegistry(),
    })

    strictEqual(operation, argsToStream)
  })
})
