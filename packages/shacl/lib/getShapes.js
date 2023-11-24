import { resolve } from 'path'

export default function getShapes(pathOrUri) {
  let url

  try {
    url = new URL(pathOrUri)
  } catch {
    const path = resolve(this.basePath, pathOrUri)
    return this.env.fromFile(path)
  }

  const response = this.env.fetch(url)
  return this.env.formats.import(response.headers['content-type'], response.body)
}
