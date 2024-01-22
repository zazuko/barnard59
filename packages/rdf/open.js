/**
 * @this {import('barnard59-core').Context}
 * @param {string} pathOrUri
 * @param {string} [mediaTypeOverride]
 * @return {Promise<import('@rdfjs/types').Stream>}
 */
export default async function (pathOrUri, mediaTypeOverride) {
  let url

  try {
    url = new URL(pathOrUri)
  } catch {
    return this.env.fromFile(pathOrUri, { implicitBaseIRI: true })
  }

  const response = await this.env.fetch(url)
  if (!response.body) {
    throw new Error(`Empty response from ${url}`)
  }

  let parserStream
  if (mediaTypeOverride) {
    parserStream = this.env.formats.parsers.import(
      mediaTypeOverride,
      // @ts-expect-error
      response.body, {
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
