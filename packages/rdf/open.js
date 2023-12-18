export default async function (pathOrUri, mediaTypeOverride) {
  let url

  try {
    url = new URL(pathOrUri)
  } catch {
    return this.env.fromFile(pathOrUri)
  }

  const response = await this.env.fetch(url)
  let parserStream
  if (mediaTypeOverride) {
    parserStream = this.env.formats.parsers.import(mediaTypeOverride, response.body, {
      baseIRI: response.url,
    })

    if (!parserStream) {
      throw new Error(`No parser found for ${mediaTypeOverride}`)
    }
  } else {
    parserStream = await response.quadStream()
  }

  return parserStream
}
