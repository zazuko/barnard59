import rdfFetch from '@rdfjs/fetch'
import type { Environment } from 'barnard59-env'
import type { DatasetResponse } from '@rdfjs/fetch-lite'
import type { DatasetCore } from '@rdfjs/types'
import checkResponse from './checkResponse.js'
import commonFetch from './commonFetch.js'

async function fetchMetadata(rdf: Environment, url: URL | string) {
  const res: DatasetResponse<DatasetCore> = await rdfFetch(url.toString(), {
    contentTypeLookup: (extension: string | undefined) => extension === '.json' ? 'application/ld+json' : undefined,
    factory: rdf,
    fetch: commonFetch,
  } as any) as any // eslint-disable-line @typescript-eslint/no-explicit-any

  return checkResponse(res, async (res) => {
    if (!('dataset' in res)) {
      throw new Error('response is empty')
    }

    return rdf.clownface({ dataset: await res.dataset() })
  })
}

export default fetchMetadata
