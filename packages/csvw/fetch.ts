import toReadable from 'duplex-to/readable.js'
import { PassThrough } from 'readable-stream'
import type { Context } from 'barnard59-core'
import { JsonLdParser } from 'jsonld-streaming-parser'
import fetchData from './lib/fetchData.js'
import fetchMetadata from './lib/fetchMetadata.js'
import documentLoader from './lib/jsonLdUtils.js'

interface Options {
  csvw: URL | string
  useRemoteCsvwContext?: boolean
}

function fetch(this: Context, { csvw, useRemoteCsvwContext }: Options) {
  const output = new PassThrough()

  if (!useRemoteCsvwContext) {
    this.env.formats.parsers.set('application/ld+json', new JsonLdParser({
      documentLoader,
    }))
  }

  Promise.resolve().then(async () => {
    try {
      const metadata = await fetchMetadata(this.env, csvw)
      const url = metadata.any().has(this.env.ns.csvw.url).out(this.env.ns.csvw.url)
      const dataStream = await fetchData(url.value!)

      dataStream!.pipe(output)
    } catch (err: any) { // eslint-disable-line @typescript-eslint/no-explicit-any
      output.destroy(err)
    }
  })

  return toReadable(output)
}

export default fetch
