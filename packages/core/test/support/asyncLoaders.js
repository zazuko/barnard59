const ecmaScriptLoader = require('../../lib/loader/ecmaScript')

function promisedUrl () {
  return Promise.resolve().then(() => 'http://worldclockapi.com/api/json/cet/now')
}
promisedUrl.register = r => r.registerNodeLoader('http://example.org/PromisedUrl', promisedUrl)

function promiseWrapper () {
  const params = arguments
  return Promise.resolve().then(() => ecmaScriptLoader.apply(this, params))
}

promiseWrapper.register = r => r.registerNodeLoader('http://example.org/DeferredEcmaScript', promiseWrapper)

module.exports = {
  promisedUrl,
  promiseWrapper
}
