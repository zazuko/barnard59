import transform from 'rdf-transform-graph-imports'

export default function () {
  return transform(this.env)
}
