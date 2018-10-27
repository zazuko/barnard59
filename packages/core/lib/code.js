const code = require('./namespaces').code
const evalTemplateLiteral = require('./evalTemplateLiteral')
const iriRequire = require('./iriRequire')

function parse (value, context, variables, basePath) {
  if (value.term.termType === 'Literal') {
    return parseEcmaScript(value, context) || parseEcmaScriptTemplateLiteral(value, context, variables)
  }

  const link = value.out(code('link'))
  const type = value.out(code('type'))

  if (link.term && link.term.termType === 'NamedNode') {
    if (type.term && type.term.equals(code('ecmaScript'))) {
      return iriRequire(link.value, basePath)
    }
  }

  return null
}

function parseEcmaScript (value, context) {
  if (value.term.termType !== 'Literal' || !value.term.datatype.equals(code('ecmaScript'))) {
    return null
  }

  return (function () { return eval(value.value) }).call(context) // eslint-disable-line no-eval,no-extra-parens
}

function parseEcmaScriptTemplateLiteral (value, context, variables) {
  if (value.term.termType !== 'Literal' || !value.term.datatype.equals(code('ecmaScriptTemplateLiteral'))) {
    return null
  }

  return evalTemplateLiteral(value.value, context, variables)
}

module.exports = {
  parse,
  parseEcmaScript,
  parseEcmaScriptTemplateLiteral
}
