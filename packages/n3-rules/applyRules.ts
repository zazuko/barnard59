import eyeling from 'eyeling'

export default function ({rulesText, includeInput = false}: { rulesText: string; includeInput?: boolean }) {
  const rules = JSON.parse(eyeling.reason({ args: ["--ast"]}, rulesText))

  return async function* (stream: AsyncIterable<eyeling.RdfJsQuad[]>) {
    for await (const quads of stream) {
        const derivedQuads = includeInput ? [...quads] : []
        for await (const quad of eyeling.reasonRdfJs({ quads, rules })) {
            derivedQuads.push(quad)
        }
        yield derivedQuads
    }
  }
}
