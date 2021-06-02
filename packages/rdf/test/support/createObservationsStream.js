const clownface = require('clownface')
const rdf = require('rdf-ext')
const { Readable } = require('readable-stream')
const ns = require('./namespaces')

function createObservationsStream ({ observations = [{ [ns.ex.property.value]: rdf.literal('test') }] } = {}) {
  const datasets = []

  observations.forEach((observation, index) => {
    const observationPtr = clownface({
      dataset: rdf.dataset(),
      term: ns.ex(`cube/observation/${index + 1}`)
    })

    observationPtr.addIn(ns.cube.observation, ns.ex('cube/observation/'))
    observationPtr.addOut(ns.rdf.type, ns.cube.Observation)

    for (const [property, value] of Object.entries(observation)) {
      observationPtr.addOut(rdf.namedNode(property), value)
    }

    datasets.push(observationPtr.dataset)
  })

  return Readable.from(datasets)
}

module.exports = createObservationsStream
