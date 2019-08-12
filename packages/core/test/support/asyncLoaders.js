const cf = require('clownface')
const rdf = require('rdf-ext')
const ecmaScriptLoader = require('rdf-loader-code/ecmaScript')

function promisedUrl (term, dataset) {
  const node = cf(dataset).node(term)
  return Promise.resolve().then(() => node.out(rdf.namedNode('http://example.org/url')).value)
}
promisedUrl.register = r => r.registerNodeLoader('http://example.org/PromisedUrl', promisedUrl)

function ecmaScriptLoaderWrapper () {
  const params = arguments
  return Promise.resolve().then(() => ecmaScriptLoader.apply(this, params))
}

ecmaScriptLoaderWrapper.register = r => r.registerNodeLoader('http://example.org/DeferredEcmaScript', ecmaScriptLoaderWrapper)

module.exports = {
  promisedUrl,
  ecmaScriptLoaderWrapper
}
