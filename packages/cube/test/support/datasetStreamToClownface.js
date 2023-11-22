import getStream from 'get-stream'
import rdf from 'barnard59-env'

async function datasetStreamToClownface(stream) {
  const datasets = await getStream.array(stream)

  return rdf.clownface({ dataset: datasets.reduce((all, current) => all.addAll(current), rdf.dataset()) })
}

export default datasetStreamToClownface
