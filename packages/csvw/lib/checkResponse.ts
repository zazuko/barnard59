async function checkResponse<R extends Response, T>(res: R, cb: (res: R & Required<Pick<R, 'body'>>) => T) {
  if (!res.ok && res.body) {
    throw new Error(`${res.statusText}(${res.status}): ${await res.text()}`)
  }

  return cb(res)
}

export default checkResponse
