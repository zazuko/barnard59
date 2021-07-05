import clownface from 'clownface'
import rdf from 'rdf-ext'
import { Readable } from 'readable-stream'
import * as ns from './namespaces.js'

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

export default createObservationsStream
