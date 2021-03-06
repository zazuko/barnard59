import { strictEqual } from 'assert'
import { resolve } from 'path'
import getStream from 'get-stream'
import { describe, it } from 'mocha'
import loadPipelineDefinition from '../support/loadPipelineDefinition.js'
import ns from '../support/namespaces.js'
import Step from '../../lib/Step.js'
import createStep from '../../lib/factory/step.js'
import defaultLoaderRegistry from '../../lib/defaultLoaderRegistry.js'
import defaultLogger from '../../lib/defaultLogger.js'

describe('factory/step', () => {
  it('should be a method', () => {
    strictEqual(typeof createStep, 'function')
  })

  it('should load the given step', async () => {
    const definition = await loadPipelineDefinition('plain')
    const ptr = [...definition.node(ns.ex('')).out(ns.p.steps).out(ns.p.stepList).list()][0]

    const step = await createStep(ptr, {
      basePath: resolve('test'),
      loaderRegistry: defaultLoaderRegistry(),
      logger: defaultLogger()
    })

    strictEqual(step instanceof Step, true)
  })

  it('should attach step to the context', async () => {
    const definition = await loadPipelineDefinition('step-ptr')
    const ptr = [...definition.node(ns.ex('')).out(ns.p.steps).out(ns.p.stepList).list()][0]

    const step = await createStep(ptr, {
      basePath: resolve('test'),
      loaderRegistry: defaultLoaderRegistry(),
      logger: defaultLogger()
    })

    const result = await getStream(step.stream)

    strictEqual(result, ns.ex.stepPtr.value)
  })
})
