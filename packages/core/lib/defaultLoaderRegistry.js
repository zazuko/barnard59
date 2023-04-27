import ecmaScriptLoader from 'rdf-loader-code/ecmaScript.js'
import ecmaScriptLiteralLoader from 'rdf-loader-code/ecmaScriptLiteral.js'
// eslint-disable-next-line import/default
import ecmaScriptModuleLoader from 'rdf-loader-code/ecmaScriptModule.js'
import LoaderRegistry from 'rdf-loaders-registry'
import pipelineLoader from './loader/pipeline.js'
import variableLoader from './loader/variable.js'

function factory() {
  const registry = new LoaderRegistry()

  ecmaScriptLoader.register(registry)
  ecmaScriptLiteralLoader.register(registry)
  ecmaScriptModuleLoader.register(registry)
  pipelineLoader.register(registry)
  variableLoader.register(registry)

  return registry
}

export default factory
