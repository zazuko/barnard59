import { Readable } from 'readable-stream'

export function generate() {
  const { env } = this

  let iteration = 0

  return new Readable({
    objectMode: true,
    read(size) {
      iteration++
      for (let i = 1; i <= size; i++) {
        this.push(env.quad(
          env.namedNode(`http://example.org/s/${iteration}/${i}`),
          env.namedNode(`http://example.org/p/${iteration}/${i}`),
          env.namedNode(`http://example.org/o/${iteration}/${i}`),
        ))
      }
    },
  })
}
