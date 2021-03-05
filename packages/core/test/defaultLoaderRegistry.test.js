import { strictEqual } from 'assert'
import { describe, it } from 'mocha'
import ns from './support/namespaces.js'
import defaultLoaderRegistry from '../lib/defaultLoaderRegistry.js'

describe('defaultLoaderRegistry', () => {
  it('should be a function', () => {
    strictEqual(typeof defaultLoaderRegistry, 'function')
  })

  it('should contain the EcmaScript literal loader', () => {
    const registry = defaultLoaderRegistry()

    strictEqual(typeof registry._literalLoaders.get(ns.code.EcmaScript.value), 'function')
  })

  it('should contain the EcmaScriptTemplateLiteral literal loader', () => {
    const registry = defaultLoaderRegistry()

    strictEqual(typeof registry._literalLoaders.get(ns.code.EcmaScriptTemplateLiteral.value), 'function')
  })

  it('should contain the VariableName literal loader', () => {
    const registry = defaultLoaderRegistry()

    strictEqual(typeof registry._literalLoaders.get(ns.p.VariableName.value), 'function')
  })

  it('should contain the EcmaScript node loader', () => {
    const registry = defaultLoaderRegistry()

    strictEqual(typeof registry._nodeLoaders.get(ns.code.EcmaScript.value), 'function')
  })

  it('should contain the EcmaScriptModule node loader', () => {
    const registry = defaultLoaderRegistry()

    strictEqual(typeof registry._nodeLoaders.get(ns.code.EcmaScriptModule.value), 'function')
  })

  it('should contain the Pipeline node loader', () => {
    const registry = defaultLoaderRegistry()

    strictEqual(typeof registry._nodeLoaders.get(ns.p.Pipeline.value), 'function')
  })

  it('should contain the Variable node loader', () => {
    const registry = defaultLoaderRegistry()

    strictEqual(typeof registry._nodeLoaders.get(ns.p.Variable.value), 'function')
  })
})
