export default async function (pathOrUri) {
  let url

  try {
    url = new URL(pathOrUri)
  } catch {
    return this.env.fromFile(pathOrUri)
  }

  const response = await this.env.fetch(url)
  let contentType = response.headers.get('content-type')
  if (!contentType) {
    this.logger.warn(`No content-type header found for ${url}. Trying n-triples`)
    contentType = 'application/n-triples'
  }

  const parserStream = this.env.formats.parsers.import(contentType, response.body)
  if (!parserStream) {
    throw new Error(`No parser found for ${contentType}`)
  }

  return parserStream
}
