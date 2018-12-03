/**
 * Dynamic ES6 template string evaluation
 * @param content The template string
 * @param context The this context for the evaluation
 * @param variables The parameters as key/values in an object
 * @returns string The result of the evaluation
 */
function evalTemplateLiteral (content, { context, variables }) {
  const keys = [...variables.keys()]
  const values = keys.map(key => variables.get(key))
  const template = Function(keys, `return \`${content}\``) // eslint-disable-line no-new-func

  return template.apply(context, values)
}

module.exports = evalTemplateLiteral
