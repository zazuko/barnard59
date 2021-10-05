import namespace from '@rdfjs/namespace'
import toReadable from 'duplex-to/readable.js'
import { PassThrough } from 'readable-stream'
import fetchData from './lib/fetchData.js'
import fetchMetadata from './lib/fetchMetadata.js'

const ns = {
  csvw: namespace('http://www.w3.org/ns/csvw#')
}

function fetch ({ csvw }) {
  const output = new PassThrough()

  Promise.resolve().then(async () => {
    try {
      const metadata = await fetchMetadata(csvw)
      const url = metadata.any().has(ns.csvw.url).out(ns.csvw.url)
      const dataStream = await fetchData(url.value)

      dataStream.pipe(output)
    } catch (err) {
      output.destroy(err)
    }
  })

  return toReadable(output)
}

export default fetch
