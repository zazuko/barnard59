export default async function (pathOrUri, mediaTypeOverride) {
  let url

  try {
    url = new URL(pathOrUri)
  } catch {
    return this.env.fromFile(pathOrUri)
  }

  const response = await this.env.fetch(url)
  let contentType
  if (mediaTypeOverride) {
    contentType = mediaTypeOverride
  } else {
    contentType = response.headers.get('content-type')
    if (!contentType) {
      throw new Error(`No content-type header found for ${url}`)
    }
  }

  const parserStream = this.env.formats.parsers.import(contentType, response.body)
  if (!parserStream) {
    throw new Error(`No parser found for ${contentType}`)
  }

  return parserStream
}
