export default function (batch) {
  const result = this.env.dataset()
  for (const quads of batch) {
    result.addAll(quads)
  }
  return result
}
