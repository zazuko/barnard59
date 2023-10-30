import { strictEqual } from 'assert'
import env from 'barnard59-env'
import defaultLoaderRegistry from '../lib/defaultLoaderRegistry.js'
import ns from './support/namespaces.js'

describe('defaultLoaderRegistry', () => {
  let registry

  beforeEach(() => {
    registry = defaultLoaderRegistry(env)
  })

  it('should contain the EcmaScript literal loader', () => {
    strictEqual(typeof registry._literalLoaders.get(ns.code.EcmaScript.value), 'function')
  })

  it('should contain the EcmaScriptTemplateLiteral literal loader', () => {
    strictEqual(typeof registry._literalLoaders.get(ns.code.EcmaScriptTemplateLiteral.value), 'function')
  })

  it('should contain the VariableName literal loader', () => {
    strictEqual(typeof registry._literalLoaders.get(ns.p.VariableName.value), 'function')
  })

  it('should contain the EcmaScript node loader', () => {
    strictEqual(typeof registry._nodeLoaders.get(ns.code.EcmaScript.value), 'function')
  })

  it('should contain the EcmaScriptModule node loader', () => {
    strictEqual(typeof registry._nodeLoaders.get(ns.code.EcmaScriptModule.value), 'function')
  })

  it('should contain the Pipeline node loader', () => {
    strictEqual(typeof registry._nodeLoaders.get(ns.p.Pipeline.value), 'function')
  })

  it('should contain the Variable node loader', () => {
    strictEqual(typeof registry._nodeLoaders.get(ns.p.Variable.value), 'function')
  })
})
