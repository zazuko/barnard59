import { strictEqual, rejects } from 'assert'
import { resolve } from 'path'
import getStream from 'get-stream'
import { pipelineDefinitionLoader } from 'barnard59-test-support/loadPipelineDefinition.js'
import env from 'barnard59-env'
import defaultLoaderRegistry from '../../lib/defaultLoaderRegistry.js'
import defaultLogger from '../../lib/defaultLogger.js'
import createStep from '../../lib/factory/step.js'
import Step from '../../lib/Step.js'
import ns from '../support/namespaces.js'

const loadPipelineDefinition = pipelineDefinitionLoader(import.meta.url, '../support/definitions')
const context = { env }

describe('factory/step', () => {
  it('should be a method', () => {
    strictEqual(typeof createStep, 'function')
  })

  it('should load the given step', async () => {
    const { ptr: definition } = await loadPipelineDefinition('plain')
    const ptr = [...definition.node(ns.ex('')).out(ns.p.steps).out(ns.p.stepList).list()][0]

    const step = await createStep(ptr, {
      context,
      basePath: resolve('test'),
      loaderRegistry: defaultLoaderRegistry(env),
      logger: defaultLogger(),
    })

    strictEqual(step instanceof Step, true)
  })

  it('should forward errors thrown by the loader', async () => {
    const { ptr: definition } = await loadPipelineDefinition('step-operation-missing-error')
    const ptr = [...definition.node(ns.ex('')).out(ns.p.steps).out(ns.p.stepList).list()][0]

    await rejects(async () => {
      await createStep(ptr, {
        context,
        basePath: resolve('test'),
        loaderRegistry: defaultLoaderRegistry(env),
        logger: defaultLogger(),
      })
    }, err => {
      strictEqual(err.message.includes('step'), true)
      strictEqual(err.message.includes(ptr.value), true)

      return true
    })
  })

  it('should attach step to the context', async () => {
    const { ptr: definition } = await loadPipelineDefinition('step-ptr')
    const ptr = [...definition.node(ns.ex('')).out(ns.p.steps).out(ns.p.stepList).list()][0]

    const step = await createStep(ptr, {
      context,
      basePath: resolve('test'),
      loaderRegistry: defaultLoaderRegistry(env),
      logger: defaultLogger(),
    })

    const result = await getStream(step.stream)

    strictEqual(result, ns.ex.stepPtr.value)
  })
})
