const code = require('../namespaces').code
const evalTemplateLiteral = require('../evalTemplateLiteral')

module.exports = (node, dataset, context, variables) => {
  if (!(node.termType !== 'Literal' || !node.datatype.equals(code('ecmaScriptLiteral')))) {
    return evalTemplateLiteral(node.value, context, variables)
  }

  const err = new Error(`Cannot load ES6 literal from node ${node}`)
  err.node = node
  throw err
}
