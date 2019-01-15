const cf = require('clownface')
const namespace = require('@rdfjs/namespace')
const ns = require('../lib/namespaces')
const pipeline = require('..').pipeline
const rdf = require('rdf-ext')
const run = require('..').run

const base = namespace('http://example.org/pipeline#')

function buildDefinition () {
  const dataset = rdf.dataset()

  const def = cf(dataset, base('pipeline'))

  def
    .addOut(ns.rdf('type'), ns.p('Pipeline'))
    .addOut(ns.p('variables'), variables => {
      variables
        .addOut(ns.p('variable'), filename => {
          filename
            .addOut(ns.p('name'), 'filename')
            .addOut(ns.p('value'), 'examples/test.csv')
            .addOut(ns.rdf('type'), ns.p('Variable'))
        })
    })
    .addOut(ns.p('steps'), steps => {
      steps.addList(ns.p('stepList'), [
        def.node(base('readFile'))
          .addOut(ns.code('implementedBy'), code => {
            code
              .addOut(ns.code('link'), def.node('node:fs#createReadStream', { type: 'NamedNode' }))
              .addOut(ns.rdf('type'), ns.code('EcmaScript'))
          })
          .addList(ns.code('arguments'), [
            def.node('${filename}', { datatype: ns.code('EcmaScriptTemplateLiteral') }) // eslint-disable-line no-template-curly-in-string
          ]),
        def.node(base('parseCsv'))
          .addOut(ns.code('implementedBy'), code => {
            code
              .addOut(ns.code('link'), def.node('file:steps/parseCsv.js', { type: 'NamedNode' }))
              .addOut(ns.rdf('type'), ns.code('EcmaScript'))
          }),
        def.node(base('serializeJson'))
          .addOut(ns.code('implementedBy'), code => {
            code
              .addOut(ns.code('link'), def.node('file:steps/serializeJson.js', { type: 'NamedNode' }))
              .addOut(ns.rdf('type'), ns.code('EcmaScript'))
          })
      ])
    })

  return Promise.resolve(dataset)
}

buildDefinition()
  .then(definition => pipeline(definition, base('pipeline'), { basePath: __dirname }).pipe(process.stdout))
  .then(test => run(test))
  .catch(err => console.error(err))
