import rdf from 'rdf-ext'

export function readDataset (stream) {
  return new Promise(resolve => {
    const dataset = rdf.dataset()
    stream.on('data', triple => dataset.add(triple))

    stream.on('end', () => resolve(dataset))
  })
}
