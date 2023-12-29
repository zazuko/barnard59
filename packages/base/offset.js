export default function (offset) {
  return async function * (stream) {
    let count = 0

    for await (const chunk of stream) {
      count++
      if (count > offset) {
        yield chunk
      }
    }
  }
}
