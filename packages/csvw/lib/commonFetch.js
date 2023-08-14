import fileFetch from 'file-fetch'
import httpFetch from 'node-fetch'
import protoFetch from 'proto-fetch'

const commonFetch = protoFetch({
  file: fileFetch,
  http: httpFetch,
  https: httpFetch
})

export default commonFetch
