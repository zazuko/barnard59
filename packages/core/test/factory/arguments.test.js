import { deepStrictEqual, strictEqual } from 'assert'
import { describe, it } from 'mocha'
import defaultLoaderRegistry from '../../lib/defaultLoaderRegistry.js'
import createArguments from '../../lib/factory/arguments.js'
import loadPipelineDefinition from '../support/loadPipelineDefinition.js'
import ns from '../support/namespaces.js'
import { VariableMap } from '../../lib/VariableMap.js'

describe('factory/arguments', () => {
  it('should be a method', () => {
    strictEqual(typeof createArguments, 'function')
  })

  it('should build key-value pair arguments', async () => {
    const definition = await loadPipelineDefinition('arguments')
    const ptr = [...definition.node(ns.ex.keyValues).out(ns.p.steps).out(ns.p.stepList).list()][0]

    const args = await createArguments(ptr, { loaderRegistry: defaultLoaderRegistry() })

    deepStrictEqual(args, [{ a: '1', b: '2' }])
  })

  it('should build key-value pair arguments with undefined variable', async () => {
    const definition = await loadPipelineDefinition('arguments')
    const ptr = [...definition.node(ns.ex.keyValueMissingVar).out(ns.p.steps).out(ns.p.stepList).list()][0]
    const variables = new VariableMap()
    variables.set('a', undefined, { optional: true })

    const args = await createArguments(ptr, {
      loaderRegistry: defaultLoaderRegistry(),
      variables,
    })

    deepStrictEqual(args, [{ a: undefined }])
  })

  it('should build list arguments', async () => {
    const definition = await loadPipelineDefinition('arguments')
    const ptr = [...definition.node(ns.ex.list).out(ns.p.steps).out(ns.p.stepList).list()][0]

    const args = await createArguments(ptr, { loaderRegistry: defaultLoaderRegistry() })

    deepStrictEqual(args, ['a', 'b'])
  })

  it('should build list arguments with undefined variable', async () => {
    const definition = await loadPipelineDefinition('arguments')
    const ptr = [...definition.node(ns.ex.listMissingVar).out(ns.p.steps).out(ns.p.stepList).list()][0]
    const variables = new VariableMap()
    variables.set('a', undefined, { optional: true })

    const args = await createArguments(ptr, {
      loaderRegistry: defaultLoaderRegistry(),
      variables,
    })

    deepStrictEqual(args, [undefined])
  })

  it('should forward variables to the loader', async () => {
    const definition = await loadPipelineDefinition('arguments')
    const ptr = [...definition.node(ns.ex.variable).out(ns.p.steps).out(ns.p.stepList).list()][0]

    const args = await createArguments(ptr, {
      context: { variables: new Map([['abcd', '1234']]) },
      loaderRegistry: defaultLoaderRegistry(),
    })

    deepStrictEqual(args, ['1234'])
  })
})
