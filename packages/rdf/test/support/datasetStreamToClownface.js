const clownface = require('clownface')
const getStream = require('get-stream')
const rdf = require('rdf-ext')

async function datasetStreamToClownface (stream) {
  const datasets = await getStream.array(stream)

  return clownface({ dataset: datasets.reduce((all, current) => all.addAll(current), rdf.dataset()) })
}

module.exports = datasetStreamToClownface
