import clownface from 'clownface'
import getStream from 'get-stream'
import rdf from 'rdf-ext'

async function datasetStreamToClownface (stream) {
  const datasets = await getStream.array(stream)

  return clownface({ dataset: datasets.reduce((all, current) => all.addAll(current), rdf.dataset()) })
}

export default datasetStreamToClownface
