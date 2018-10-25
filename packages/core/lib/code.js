const evalTemplateLiteral = require('./evalTemplateLiteral')

function parse (value, context, variables) {
  return parseEcmaScript(value, context) || parseEcmaScriptTemplateLiteral(value, context, variables)
}

function parseEcmaScript (value, context) {
  if (value.term.termType !== 'Literal' || value.term.datatype.value !== 'http://example.org/code/ecmaScript') {
    return null
  }

  return (function () { return eval(value.value) }).call(context) // eslint-disable-line no-eval,no-extra-parens
}

function parseEcmaScriptTemplateLiteral (value, context, variables) {
  if (value.term.termType !== 'Literal' || value.term.datatype.value !== 'http://example.org/code/ecmaScriptTemplateLiteral') {
    return null
  }

  return evalTemplateLiteral(value.value, context, variables)
}

module.exports = {
  parse,
  parseEcmaScript,
  parseEcmaScriptTemplateLiteral
}
