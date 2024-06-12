import toReadable from 'duplex-to/readable.js'
import { PassThrough } from 'readable-stream'
import type { Context } from 'barnard59-core'
import fetchData from './lib/fetchData.js'
import fetchMetadata from './lib/fetchMetadata.js'

function fetch(this: Context, { csvw }: { csvw: URL | string }) {
  const output = new PassThrough()

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
