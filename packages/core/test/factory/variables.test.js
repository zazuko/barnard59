import { resolve } from 'path'
import { expect } from 'chai'
import { describe, it } from 'mocha'
import defaultLoaderRegistry from '../../lib/defaultLoaderRegistry.js'
import createVariables from '../../lib/factory/variables.js'
import { VariableMap } from '../../lib/VariableMap.js'
import loadPipelineDefinition from '../support/loadPipelineDefinition.js'
import ns from '../support/namespaces.js'

describe('factory/variables', () => {
  it('should return a VariableMap', async () => {
    const definition = await loadPipelineDefinition('plain')
    const ptr = definition.node(ns.ex('')).out(ns.p.variables)

    const variables = await createVariables(ptr, {
      basePath: resolve('test'),
      loaderRegistry: defaultLoaderRegistry(),
    })

    expect(variables).to.be.instanceOf(VariableMap)
  })

  it('should load "required" annotation', async () => {
    const definition = await loadPipelineDefinition('variables')
    const ptr = definition.node(ns.ex.inline).out(ns.p.variables)

    const variables = await createVariables(ptr, {
      basePath: resolve('test'),
      loaderRegistry: defaultLoaderRegistry(),
    })

    expect(variables.get('optional')).to.be.undefined
  })

  it('should load the given inline variables', async () => {
    const definition = await loadPipelineDefinition('variables')
    const ptr = definition.node(ns.ex.inline).out(ns.p.variables)

    const variables = await createVariables(ptr, {
      basePath: resolve('test'),
      loaderRegistry: defaultLoaderRegistry(),
    })

    expect([...variables.entries()]).to.deep.contain.members([['foo', 'bar']])
  })

  it('should load the given variables sets', async () => {
    const definition = await loadPipelineDefinition('variables')
    const ptr = definition.node(ns.ex.multiset).out(ns.p.variables)

    const variables = await createVariables(ptr, {
      basePath: resolve('test'),
      loaderRegistry: defaultLoaderRegistry(),
    })

    expect([...variables.entries()]).to.deep.contain.members([
      ['auth', 'http://auth0.com/connect/token'],
      ['username', 'tpluscode'],
    ])
  })
})
