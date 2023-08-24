import fromStream from 'rdf-dataset-ext/fromStream.js'
import rdf from '@zazuko/env'

export function toDataset(streamOrDataset) {
  if (!streamOrDataset.readable) {
    return Promise.resolve(streamOrDataset)
  }

  return fromStream(rdf.dataset(), streamOrDataset)
}
