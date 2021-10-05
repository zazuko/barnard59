async function checkResponse (res) {
  if (!res.ok) {
    throw new Error(`${res.statusText}(${res.status}): ${await res.text()}`)
  }
}

export default checkResponse
