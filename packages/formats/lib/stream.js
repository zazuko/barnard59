export function toDataset(rdf, streamOrDataset) {
  if (!streamOrDataset.readable) {
    return Promise.resolve(streamOrDataset)
  }

  return rdf.dataset().import(streamOrDataset)
}
