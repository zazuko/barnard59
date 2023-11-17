import rdf from 'barnard59-env'
import { Readable } from 'readable-stream'
import { ex } from './namespaces.js'

function createObservationsStream({ observations = [{ [ex.property.value]: rdf.literal('test') }] } = {}) {
  const datasets = []

  observations.forEach((observation, index) => {
    const observationPtr = rdf.clownface({
      dataset: rdf.dataset(),
      term: ex(`cube/observation/${index + 1}`),
    })

    observationPtr.addIn(rdf.ns.cube.observation, ex('cube/observation/'))
    observationPtr.addOut(rdf.ns.rdf.type, rdf.ns.cube.Observation)

    for (const [property, value] of Object.entries(observation)) {
      observationPtr.addOut(rdf.namedNode(property), value)
    }

    datasets.push(observationPtr.dataset)
  })

  return Readable.from(datasets)
}

export default createObservationsStream
