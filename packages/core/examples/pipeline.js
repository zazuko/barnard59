const pipeline = require('..').pipeline
const rdf = require('rdf-ext')
const run = require('..').run

function buildDefinition () {
  const ns = {
    arguments: rdf.namedNode('http://example.org/barnard59/arguments'),
    ecmaScript: rdf.namedNode('http://example.org/code/ecmaScript'),
    ecmaScriptTemplateLiteral: rdf.namedNode('http://example.org/code/ecmaScriptTemplateLiteral'),
    first: rdf.namedNode('http://www.w3.org/1999/02/22-rdf-syntax-ns#first'),
    name: rdf.namedNode('http://example.org/barnard59/name'),
    nil: rdf.namedNode('http://www.w3.org/1999/02/22-rdf-syntax-ns#nil'),
    operation: rdf.namedNode('http://example.org/barnard59/operation'),
    rest: rdf.namedNode('http://www.w3.org/1999/02/22-rdf-syntax-ns#rest'),
    stepList: rdf.namedNode('http://example.org/barnard59/stepList'),
    steps: rdf.namedNode('http://example.org/barnard59/steps'),
    type: rdf.namedNode('http://www.w3.org/1999/02/22-rdf-syntax-ns#type'),
    value: rdf.namedNode('http://example.org/barnard59/value'),
    variable: rdf.namedNode('http://example.org/barnard59/variable'),
    variables: rdf.namedNode('http://example.org/barnard59/variables'),
    Pipeline: rdf.namedNode('http://example.org/barnard59/Pipeline')
  }

  const pipeline = rdf.blankNode()
  const variables = rdf.blankNode()
  const variableFilename = rdf.blankNode()
  const stepList = rdf.blankNode()
  const readFileStep = rdf.blankNode()
  const readFile = rdf.blankNode()
  const filename = rdf.blankNode()
  const parseCsvStep = rdf.blankNode()
  const parseCsv = rdf.blankNode()
  const serializeJsonStep = rdf.blankNode()
  const serializeJson = rdf.blankNode()

  return Promise.resolve(rdf.dataset([
    rdf.quad(pipeline, ns.type, ns.Pipeline),
    rdf.quad(pipeline, ns.variables, variables),
    rdf.quad(variables, ns.variable, variableFilename),
    rdf.quad(variableFilename, ns.name, rdf.literal('filename')),
    rdf.quad(variableFilename, ns.value, rdf.literal('examples/test.csv')),
    rdf.quad(pipeline, ns.steps, stepList),
    rdf.quad(stepList, ns.stepList, readFileStep),
    rdf.quad(readFileStep, ns.first, readFile),
    rdf.quad(readFile, ns.operation, rdf.namedNode('node:fs#createReadStream')),
    rdf.quad(readFile, ns.arguments, filename),
    rdf.quad(filename, ns.first, rdf.literal('${filename}', ns.ecmaScriptTemplateLiteral)), // eslint-disable-line no-template-curly-in-string
    rdf.quad(filename, ns.rest, ns.nil),
    rdf.quad(readFileStep, ns.rest, parseCsvStep),
    rdf.quad(parseCsvStep, ns.first, parseCsv),
    rdf.quad(parseCsv, ns.operation, rdf.namedNode('file:steps/parseCsv.js')),
    rdf.quad(parseCsvStep, ns.rest, serializeJsonStep),
    rdf.quad(serializeJsonStep, ns.first, serializeJson),
    rdf.quad(serializeJson, ns.operation, rdf.namedNode('file:steps/serializeJson.js')),
    rdf.quad(serializeJsonStep, ns.rest, ns.nil)
  ]))
}

buildDefinition()
  .then(definition => pipeline(definition, { basePath: __dirname }).pipe(process.stdout))
  .then(test => run(test))
  .catch(err => console.error(err))
