const cf = require('clownface')
const fromFile = require('rdf-utils-fs/fromFile')
const rdf = require('rdf-ext')
const namespace = require('@rdfjs/namespace')

const ns = {
  schema: namespace('http://schema.org/'),
  rdf: namespace('http://www.w3.org/1999/02/22-rdf-syntax-ns#'),
  p: namespace("https://pipeline.described.at/"),
  code: namespace("https://code.described.at/")
}

const pipelineFile = 'sample-pipelines/fetch-json-to-ntriples.ttl'

async function readGraph(file) {

  const stream = await fromFile(file)
  const dataset = await rdf.dataset().import(stream)

  const clownfaceObj = cf({ dataset })

  return clownfaceObj
}

async function getPipelines(graph) {

  const pipelines = []
  graph
    .has(ns.rdf.type, ns.p.Pipeline)
    .forEach(pipeline => {
      pipelines.push(pipeline.term.value)
    })

  return pipelines
}

async function getIdentifiers(graph) {

  const pipeline2identifier = {};

  graph
    .has(ns.rdf.type, ns.p.Pipeline)
    .forEach(pipeline => {
        steps = pipeline
        .out(ns.p.steps)
        .out(ns.p.stepList)
        .list()

        pipeline2identifier[pipeline.term.value] = []

        for (const step of steps) {
          const identifier = step
            .out(ns.code.implementedBy)
            .out(ns.code.link)
            .term
          pipeline2identifier[pipeline.term.value].push(identifier.value)
        }
    })

  return pipeline2identifier
}

async function main() {

  const graph = await readGraph(pipelineFile)
  const steps = getIdentifiers(graph)

  console.log(steps)

}
main()

