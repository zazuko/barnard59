const code = require('../namespaces').code
const evalTemplateLiteral = require('../evalTemplateLiteral')

function loader (node, dataset, { context, variables }) {
  if (!(node.termType !== 'Literal' || !node.datatype.equals(code('EcmaScriptTemplateLiteral')))) {
    return evalTemplateLiteral(node.value, { context, variables })
  }

  throw new Error(`Cannot load ES6 literal from node ${node}`)
}

loader.register = registry => {
  registry.registerLiteralLoader(code('EcmaScriptTemplateLiteral'), loader)
}

module.exports = loader
