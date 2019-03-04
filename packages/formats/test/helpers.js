const rdf = require('rdf-ext')

function readDataset (stream) {
  return new Promise(resolve => {
    let dataset = rdf.dataset()
    stream.on('data', triple => dataset.add(triple))

    stream.on('end', () => resolve(dataset))
  })
}

module.exports = {
  readDataset
}
