import checkResponse from './checkResponse.js'
import commonFetch from './commonFetch.js'

async function fetchData (url) {
  const res = await commonFetch(url)

  await checkResponse(res)

  return res.body
}

export default fetchData
