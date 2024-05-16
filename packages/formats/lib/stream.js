import { isReadableStream } from 'is-stream'

/**
 * @param {import('@rdfjs/environment/Environment.js').Environment<ReturnType<import('@zazuko/env/lib/DatasetFactory.js').default>>} rdf
 * @param {(import('@rdfjs/types').Stream & import('stream').Readable) | import('@rdfjs/types').DatasetCore} streamOrDataset
 * @return {Promise<import('@rdfjs/types').DatasetCore>}
 */
export function toDataset(rdf, streamOrDataset) {
  if (!isReadableStream(streamOrDataset)) {
    return Promise.resolve(streamOrDataset)
  }

  return rdf.dataset().import(streamOrDataset)
}
