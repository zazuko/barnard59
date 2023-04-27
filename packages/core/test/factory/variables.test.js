import { deepStrictEqual, strictEqual } from 'assert'
import { resolve } from 'path'
import { describe, it } from 'mocha'
import defaultLoaderRegistry from '../../lib/defaultLoaderRegistry.js'
import createVariables from '../../lib/factory/variables.js'
import loadPipelineDefinition from '../support/loadPipelineDefinition.js'
import ns from '../support/namespaces.js'

describe('factory/variables', () => {
  it('should be a method', () => {
    strictEqual(typeof createVariables, 'function')
  })

  it('should return a Map', async () => {
    const definition = await loadPipelineDefinition('plain')
    const ptr = definition.node(ns.ex('')).out(ns.p.variables)

    const variables = await createVariables(ptr, {
      basePath: resolve('test'),
      loaderRegistry: defaultLoaderRegistry(),
    })

    strictEqual(variables instanceof Map, true)
  })

  it('should load the given inline variables', async () => {
    const definition = await loadPipelineDefinition('variables')
    const ptr = definition.node(ns.ex.inline).out(ns.p.variables)

    const variables = await createVariables(ptr, {
      basePath: resolve('test'),
      loaderRegistry: defaultLoaderRegistry(),
    })

    deepStrictEqual(variables, new Map([['foo', 'bar']]))
  })

  it('should load the given variables sets', async () => {
    const definition = await loadPipelineDefinition('variables')
    const ptr = definition.node(ns.ex.multiset).out(ns.p.variables)

    const variables = await createVariables(ptr, {
      basePath: resolve('test'),
      loaderRegistry: defaultLoaderRegistry(),
    })

    deepStrictEqual(variables, new Map([
      ['auth', 'http://auth0.com/connect/token'],
      ['username', 'tpluscode'],
    ]))
  })
})
