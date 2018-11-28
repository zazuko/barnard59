const cf = require('clownface')
const namespace = require('@rdfjs/namespace')
const ns = require('../lib/namespaces')
const pipeline = require('..').pipeline
const rdf = require('rdf-ext')
const run = require('..').run

function buildDefinition () {
  const base = namespace('http://example.org/pipeline#')
  const dataset = rdf.dataset()

  const def = cf.dataset(dataset, base('pipeline'))

  const sub = def.node(base('subPipeline'))

  sub
    .addOut(ns.rdf('type'), ns.p('Pipeline'))
    .addOut(ns.p('steps'), steps => {
      steps.addList(ns.p('stepList'), [
        def.node(base('duplicate'))
          .addOut(ns.p('operation'), code => {
            code
              .addOut(ns.code('link'), def.node('file:steps/duplicate.js', { type: 'NamedNode' }))
              .addOut(ns.code('type'), ns.code('ecmaScript'))
          })
      ])
    })

  def
    .addOut(ns.rdf('type'), ns.p('Pipeline'))
    .addOut(ns.p('variables'), variables => {
      variables
        .addOut(ns.p('variable'), filename => {
          filename
            .addOut(ns.p('name'), 'filename')
            .addOut(ns.p('value'), 'examples/test.csv')
        })
    })
    .addOut(ns.p('steps'), steps => {
      steps.addList(ns.p('stepList'), [
        def.node(base('readFile'))
          .addOut(ns.p('operation'), code => {
            code
              .addOut(ns.code('link'), def.node('node:fs#createReadStream', { type: 'NamedNode' }))
              .addOut(ns.code('type'), ns.code('ecmaScript'))
          })
          .addList(ns.p('arguments'), [
            def.node('${filename}', { datatype: ns.code('ecmaScriptTemplateLiteral') }) // eslint-disable-line no-template-curly-in-string
          ]),
        def.node(base('parseCsv'))
          .addOut(ns.p('operation'), code => {
            code
              .addOut(ns.code('link'), def.node('file:steps/parseCsv.js', { type: 'NamedNode' }))
              .addOut(ns.code('type'), ns.code('ecmaScript'))
          }),
        def.node(base('forEach'))
          .addOut(ns.p('operation'), code => {
            code
              .addOut(ns.code('link'), def.node('file:..#forEach', { type: 'NamedNode' }))
              .addOut(ns.code('type'), ns.code('ecmaScript'))
          })
          .addList(ns.p('arguments'), [sub.term]),
        def.node(base('serializeJson'))
          .addOut(ns.p('operation'), code => {
            code
              .addOut(ns.code('link'), def.node('file:steps/serializeJson.js', { type: 'NamedNode' }))
              .addOut(ns.code('type'), ns.code('ecmaScript'))
          })
      ])
    })

  return Promise.resolve({
    dataset,
    iri: def.term
  })
}

buildDefinition()
  .then(def => pipeline(def.dataset, { iri: def.iri, basePath: __dirname }).pipe(process.stdout))
  .then(test => run(test))
  .catch(err => console.error(err))
