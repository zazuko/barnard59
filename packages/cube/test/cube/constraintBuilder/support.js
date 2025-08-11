import { strictEqual } from 'node:assert'
import rdf from 'barnard59-env'
import SHACLValidator from 'rdf-validate-shacl'

const { sh } = rdf.ns

const subject = rdf.namedNode('http://example.org/subject')
const property = rdf.namedNode('http://example.org/property')

const createDataset = values =>
  rdf.clownface().namedNode(subject).addOut(property, values).dataset

export const conforms = async (validator, ...values) => {
  const report = await validator.validate(createDataset(values))
  strictEqual(report.conforms, true)
}

export const notConforms = async (validator, ...values) => {
  const report = await validator.validate(createDataset(values))
  strictEqual(report.conforms, false)
}

export const buildShape = async (builder, ...values) => {
  const shape = rdf.clownface()
  const ptr = shape.blankNode()
  shape.namedNode('http://example.org/shape')
    .addOut(sh.targetNode, subject)
    .addOut(sh.property, ptr)
  ptr.addOut(sh.path, property)

  values.forEach(x => builder.add(x))
  builder.build(ptr)

  const validator = new SHACLValidator(shape.dataset, { factory: rdf })
  await conforms(validator, ...values)
  return validator
}

export function prepareValidator(builder, ...values) {
  return async function () {
    const validator = await buildShape(builder, ...values)

    this.builder = builder
    this.assertConforms = conforms.bind(null, validator)
    this.assertNotConforms = notConforms.bind(null, validator)
  }
}
