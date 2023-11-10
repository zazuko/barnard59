import getStream from 'get-stream'
import rdf from '@zazuko/env-node'
import addAll from 'rdf-dataset-ext/addAll.js'

async function datasetStreamToClownface(stream) {
  const datasets = await getStream.array(stream)

  return rdf.clownface({ dataset: datasets.reduce((all, current) => addAll(all, current), rdf.dataset()) })
}

export default datasetStreamToClownface
