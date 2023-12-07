import { strictEqual } from 'assert'
import rdf from 'barnard59-env'
import SHACLValidator from 'rdf-validate-shacl'

const { sh } = rdf.ns

const subject = rdf.namedNode('http://example.org/subject')
const property = rdf.namedNode('http://example.org/property')

const createDataset = values =>
  rdf.clownface().namedNode(subject).addOut(property, values).dataset

export const conforms = (validator, values) => {
  const report = validator.validate(createDataset(values))
  strictEqual(report.conforms, true)
}

export const notConforms = (validator, values) => {
  const report = validator.validate(createDataset(values))
  strictEqual(report.conforms, false)
}

export const createValidator = (builder, values) => {
  const shape = rdf.clownface()
  const ptr = shape.blankNode()
  shape.namedNode('http://example.org/shape')
    .addOut(sh.targetNode, subject)
    .addOut(sh.property, ptr)
  ptr.addOut(sh.path, property)

  values.forEach(x => builder.add(x))
  builder.build(ptr)
  // console.log(shape.dataset.toCanonical())

  const validator = new SHACLValidator(shape.dataset, { factory: rdf })
  conforms(validator, values)
  return validator
}
