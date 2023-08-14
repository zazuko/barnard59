import rdf from '@zazuko/env'
import toReadable from 'duplex-to/readable.js'
import { PassThrough } from 'readable-stream'
import fetchData from './lib/fetchData.js'
import fetchMetadata from './lib/fetchMetadata.js'

function fetch({ csvw }) {
  const output = new PassThrough()

  Promise.resolve().then(async () => {
    try {
      const metadata = await fetchMetadata(csvw)
      const url = metadata.any().has(rdf.ns.csvw.url).out(rdf.ns.csvw.url)
      const dataStream = await fetchData(url.value)

      dataStream.pipe(output)
    } catch (err) {
      output.destroy(err)
    }
  })

  return toReadable(output)
}

export default fetch
