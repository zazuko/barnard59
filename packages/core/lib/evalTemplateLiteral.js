/**
 * Dynamic ES6 template string evaluation
 * @param content The template string
 * @param context The this context for the evaluation
 * @param params The parameters as key values in an object
 * @returns string The result of the evaluation
 */
function evalTemplateLiteral (content, context, params) {
  const keys = [...params.keys()]
  const values = keys.map(key => params.get(key))
  const template = Function(keys, `return \`${content}\``) // eslint-disable-line no-new-func

  return template.apply(context, values)
}

module.exports = evalTemplateLiteral
