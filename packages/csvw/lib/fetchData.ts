import { Readable } from 'node:stream'
import checkResponse from './checkResponse.js'
import commonFetch from './commonFetch.js'

async function fetchData(url: string) {
  const res = await commonFetch(url)

  return checkResponse(res, async (res) => {
    return res.body as unknown as Readable
  })
}

export default fetchData
