const jsLoader = require('rdf-native-loader-code/ecmaScript')
const pipelineLoader = require('./loader/pipeline')
const templateStringLoader = require('rdf-native-loader-code/ecmaScriptLiteral')
const variableLoader = require('./loader/variable')
const LoaderRegistry = require('rdf-native-loader')

const defaultLoaders = [
  jsLoader,
  pipelineLoader,
  templateStringLoader,
  variableLoader
]

function createLoaderRegistry (additionalLoaders = []) {
  const loaders = [ ...defaultLoaders, ...additionalLoaders ]

  return loaders.reduce((registry, loader) => {
    loader.register(registry)
    return registry
  }, new LoaderRegistry())
}

module.exports = createLoaderRegistry
