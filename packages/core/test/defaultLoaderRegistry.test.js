import { strictEqual } from 'node:assert'
import env from 'barnard59-env'
import defaultLoaderRegistry from '../lib/defaultLoaderRegistry.js'
import ns from './support/namespaces.js'

describe('defaultLoaderRegistry', function () {
  let registry

  beforeEach(function () {
    registry = defaultLoaderRegistry(env)
  })

  it('should contain the EcmaScript literal loader', function () {
    strictEqual(typeof registry._literalLoaders.get(ns.code.EcmaScript.value), 'function')
  })

  it('should contain the EcmaScriptTemplateLiteral literal loader', function () {
    strictEqual(typeof registry._literalLoaders.get(ns.code.EcmaScriptTemplateLiteral.value), 'function')
  })

  it('should contain the VariableName literal loader', function () {
    strictEqual(typeof registry._literalLoaders.get(ns.p.VariableName.value), 'function')
  })

  it('should contain the EcmaScript node loader', function () {
    strictEqual(typeof registry._nodeLoaders.get(ns.code.EcmaScript.value), 'function')
  })

  it('should contain the EcmaScriptModule node loader', function () {
    strictEqual(typeof registry._nodeLoaders.get(ns.code.EcmaScriptModule.value), 'function')
  })

  it('should contain the Pipeline node loader', function () {
    strictEqual(typeof registry._nodeLoaders.get(ns.p.Pipeline.value), 'function')
  })

  it('should contain the Variable node loader', function () {
    strictEqual(typeof registry._nodeLoaders.get(ns.p.Variable.value), 'function')
  })
})
