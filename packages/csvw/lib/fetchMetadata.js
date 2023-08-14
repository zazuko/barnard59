import rdfFetch from '@rdfjs/fetch'
import rdf from '@zazuko/env'
import checkResponse from './checkResponse.js'
import commonFetch from './commonFetch.js'

async function fetchMetadata(url) {
  const res = await rdfFetch(url.toString(), {
    contentTypeLookup: extension => extension === '.json' ? 'application/ld+json' : undefined,
    factory: rdf,
    fetch: commonFetch,
  })

  await checkResponse(res)

  if (!res.dataset) {
    throw new Error('response is empty')
  }

  return rdf.clownface({ dataset: await res.dataset() })
}

export default fetchMetadata
