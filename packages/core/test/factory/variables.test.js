import { resolve } from 'path'
import { expect } from 'chai'
import { pipelineDefinitionLoader } from 'barnard59-test-support/loadPipelineDefinition.js'
import env from 'barnard59-env'
import defaultLoaderRegistry from '../../lib/defaultLoaderRegistry.js'
import createVariables from '../../lib/factory/variables.js'
import { VariableMap } from '../../lib/VariableMap.js'
import ns from '../support/namespaces.js'

const loadPipelineDefinition = pipelineDefinitionLoader(import.meta.url, '../support/definitions')
const context = { env }

describe('factory/variables', () => {
  it('should return a VariableMap', async () => {
    const { ptr: definition } = await loadPipelineDefinition('plain')
    const ptr = definition.node(ns.ex('')).out(ns.p.variables)

    const variables = await createVariables(ptr, {
      context,
      basePath: resolve('test'),
      loaderRegistry: defaultLoaderRegistry(env),
    })

    expect(variables).to.be.instanceOf(VariableMap)
  })

  it('should load "required" annotation', async () => {
    const { ptr: definition } = await loadPipelineDefinition('variables')
    const ptr = definition.node(ns.ex.inline).out(ns.p.variables)

    const variables = await createVariables(ptr, {
      context,
      basePath: resolve('test'),
      loaderRegistry: defaultLoaderRegistry(env),
    })

    expect(variables.get('optional')).to.be.undefined
  })

  it('should load the given inline variables', async () => {
    const { ptr: definition } = await loadPipelineDefinition('variables')
    const ptr = definition.node(ns.ex.inline).out(ns.p.variables)

    const variables = await createVariables(ptr, {
      context,
      basePath: resolve('test'),
      loaderRegistry: defaultLoaderRegistry(env),
    })

    expect([...variables.entries()]).to.deep.contain.members([['foo', 'bar']])
  })

  it('should load the given variables sets', async () => {
    const { ptr: definition } = await loadPipelineDefinition('variables')
    const ptr = definition.node(ns.ex.multiset).out(ns.p.variables)

    const variables = await createVariables(ptr, {
      context,
      basePath: resolve('test'),
      loaderRegistry: defaultLoaderRegistry(env),
    })

    expect([...variables.entries()]).to.deep.contain.members([
      ['auth', 'http://auth0.com/connect/token'],
      ['username', 'tpluscode'],
    ])
  })
})
