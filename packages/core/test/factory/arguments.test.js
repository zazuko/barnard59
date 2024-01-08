import { deepStrictEqual, strictEqual } from 'assert'
import { pipelineDefinitionLoader } from 'barnard59-test-support/loadPipelineDefinition.js'
import env from 'barnard59-env'
import defaultLoaderRegistry from '../../lib/defaultLoaderRegistry.js'
import createArguments from '../../lib/factory/arguments.js'
import ns from '../support/namespaces.js'
import { VariableMap } from '../../lib/VariableMap.js'

const loadPipelineDefinition = pipelineDefinitionLoader(import.meta.url, '../support/definitions')
const context = { env }

describe('factory/arguments', () => {
  it('should be a method', () => {
    strictEqual(typeof createArguments, 'function')
  })

  it('should build key-value pair arguments', async () => {
    const { ptr: definition } = await loadPipelineDefinition('arguments')
    const ptr = [...definition.node(ns.ex.keyValues).out(ns.p.steps).out(ns.p.stepList).list()][0]

    const args = await createArguments(ptr, {
      context,
      loaderRegistry: defaultLoaderRegistry(env),
    })

    deepStrictEqual(args, [{ a: '1', b: '2' }])
  })

  it('should build key-value pair arguments with undefined variable', async () => {
    const { ptr: definition } = await loadPipelineDefinition('arguments')
    const ptr = [...definition.node(ns.ex.keyValueMissingVar).out(ns.p.steps).out(ns.p.stepList).list()][0]
    const variables = new VariableMap()
    variables.set('a', undefined, { optional: true })

    const args = await createArguments(ptr, {
      context,
      loaderRegistry: defaultLoaderRegistry(env),
      variables,
    })

    deepStrictEqual(args, [{ a: undefined }])
  })

  it('should build list arguments', async () => {
    const { ptr: definition } = await loadPipelineDefinition('arguments')
    const ptr = [...definition.node(ns.ex.list).out(ns.p.steps).out(ns.p.stepList).list()][0]

    const args = await createArguments(ptr, {
      context,
      loaderRegistry: defaultLoaderRegistry(env),
    })

    deepStrictEqual(args, ['a', 'b'])
  })

  it('should build list arguments with undefined variable', async () => {
    const { ptr: definition } = await loadPipelineDefinition('arguments')
    const ptr = [...definition.node(ns.ex.listMissingVar).out(ns.p.steps).out(ns.p.stepList).list()][0]
    const variables = new VariableMap()
    variables.set('a', undefined, { optional: true })

    const args = await createArguments(ptr, {
      context,
      loaderRegistry: defaultLoaderRegistry(env),
      variables,
    })

    deepStrictEqual(args, [undefined])
  })

  it('should forward variables to the loader', async () => {
    const { ptr: definition } = await loadPipelineDefinition('arguments')
    const ptr = [...definition.node(ns.ex.variable).out(ns.p.steps).out(ns.p.stepList).list()][0]

    const args = await createArguments(ptr, {
      context: { env, variables: new Map([['abcd', '1234']]) },
      loaderRegistry: defaultLoaderRegistry(env),
    })

    deepStrictEqual(args, ['1234'])
  })
})
