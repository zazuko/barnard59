import { equal, strictEqual, throws } from 'assert'
import namespace from '@rdfjs/namespace'
import getStream from 'get-stream'
import { isDuplex } from 'isstream'
import { describe, it } from 'mocha'
import rdf from 'rdf-ext'
import { Readable } from 'readable-stream'
import append from '../lib/append.js'
import { toTarget, fromSource } from '../lib/membership.js'
import * as ns from '../lib/namespaces.js'

const ex = namespace('http://example.org/')

function toCanonical (quads) {
  const dataset = rdf.dataset().addAll(quads)
  return dataset.toCanonical()
}

describe('membership.toTarget', () => {
  it('should be a factory', () => {
    strictEqual(typeof append, 'function')
  })

  const parameterSet = [
    { targetUri: undefined, targetClass: ex.targetClass, property: ex.property, classes: [ex.class] },
    { targetUri: ex.targetUri, targetClass: undefined, property: ex.property, classes: [ex.class] },
    { targetUri: ex.targetUri, targetClass: ex.targetClass, property: undefined, classes: [ex.class] },
    { targetUri: ex.targetUri, targetClass: ex.targetClass, property: ex.property, classes: undefined },
    { targetUri: ex.targetUri, targetClass: ex.targetClass, property: ex.property, classes: [] }
  ]
  parameterSet.forEach(params => {
    it('should throw an error if a mandatory parameter is missing', async () => {
      throws(() => {
        toTarget(params)
      }, Error)
    })
  })

  it('should return a duplex stream with valid parameters', () => {
    const step = toTarget({
      targetUri: ex.targetUri,
      targetClass: ex.targetClass,
      property: ex.property,
      classes: [ex.class]
    })
    strictEqual(isDuplex(step), true)
  })

  it('should append meta-data to the data', async () => {
    const data = [
      rdf.quad(ex.bob, ns.rdf.type, ex.Person),
      rdf.quad(ex.alice, ns.rdf.type, ex.Person),
      rdf.quad(ex.fido, ns.rdf.type, ex.Dog),
      rdf.quad(ex.tom, ns.rdf.type, ex.Cat)
    ]

    const expectedMetadata = [
      rdf.quad(ex.bob, ex.in, ex.house),
      rdf.quad(ex.alice, ex.in, ex.house),
      rdf.quad(ex.tom, ex.in, ex.house),
      rdf.quad(ex.house, ns.rdf.type, ex.Container)
    ]

    const step = toTarget({
      targetUri: ex.house,
      targetClass: ex.Container,
      property: ex.in,
      classes: [ex.Person, ex.Cat]
    })

    const result = await getStream.array(Readable.from(data).pipe(step))

    equal(
      toCanonical(result),
      toCanonical([...data, ...expectedMetadata])
    )
  })

  it('should append meta-data to the data with string parameters', async () => {
    const data = [
      rdf.quad(ex.bob, ns.rdf.type, ex.Person),
      rdf.quad(ex.alice, ns.rdf.type, ex.Person),
      rdf.quad(ex.fido, ns.rdf.type, ex.Dog),
      rdf.quad(ex.tom, ns.rdf.type, ex.Cat)
    ]

    const expectedMetadata = [
      rdf.quad(ex.bob, ex.in, ex.house),
      rdf.quad(ex.alice, ex.in, ex.house),
      rdf.quad(ex.tom, ex.in, ex.house),
      rdf.quad(ex.house, ns.rdf.type, ex.Container)
    ]

    const step = toTarget({
      targetUri: ex.house.value,
      targetClass: ex.Container.value,
      property: ex.in.value,
      classes: [ex.Person.value, ex.Cat.value]
    })

    const result = await getStream.array(Readable.from(data).pipe(step))

    equal(
      toCanonical(result),
      toCanonical([...data, ...expectedMetadata])
    )
  })
})

describe('membership.fromSource', () => {
  it('should be a factory', () => {
    strictEqual(typeof append, 'function')
  })

  const parameterSet = [
    { sourceUri: undefined, sourceClass: ex.sourceClass, property: ex.property, classes: [ex.class] },
    { sourceUri: ex.sourceUri, sourceClass: undefined, property: ex.property, classes: [ex.class] },
    { sourceUri: ex.sourceUri, sourceClass: ex.sourceClass, property: undefined, classes: [ex.class] },
    { sourceUri: ex.sourceUri, sourceClass: ex.sourceClass, property: ex.property, classes: undefined },
    { sourceUri: ex.sourceUri, sourceClass: ex.sourceClass, property: ex.property, classes: [] }
  ]
  parameterSet.forEach(params => {
    it('should throw an error if a mandatory parameter is missing', async () => {
      throws(() => {
        fromSource(params)
      }, Error)
    })
  })

  it('should return a duplex stream with valid parameters', () => {
    const step = fromSource({
      sourceUri: ex.house,
      sourceClass: ex.Container,
      property: ex.contains,
      classes: [ex.Person, ex.Cat]
    })
    strictEqual(isDuplex(step), true)
  })

  it('should append meta-data to the data', async () => {
    const data = [
      rdf.quad(ex.bob, ns.rdf.type, ex.Person),
      rdf.quad(ex.alice, ns.rdf.type, ex.Person),
      rdf.quad(ex.fido, ns.rdf.type, ex.Dog),
      rdf.quad(ex.tom, ns.rdf.type, ex.Cat)
    ]

    const expectedMetadata = [
      rdf.quad(ex.house, ex.contains, ex.bob),
      rdf.quad(ex.house, ex.contains, ex.alice),
      rdf.quad(ex.house, ex.contains, ex.tom),
      rdf.quad(ex.house, ns.rdf.type, ex.Container)
    ]

    const step = fromSource({
      sourceUri: ex.house,
      sourceClass: ex.Container,
      property: ex.contains,
      classes: [ex.Person, ex.Cat]
    })

    const result = await getStream.array(Readable.from(data).pipe(step))

    equal(
      toCanonical(result),
      toCanonical([...data, ...expectedMetadata])
    )
  })

  it('should append meta-data to the data with string parameters', async () => {
    const data = [
      rdf.quad(ex.bob, ns.rdf.type, ex.Person),
      rdf.quad(ex.alice, ns.rdf.type, ex.Person),
      rdf.quad(ex.fido, ns.rdf.type, ex.Dog),
      rdf.quad(ex.tom, ns.rdf.type, ex.Cat)
    ]

    const expectedMetadata = [
      rdf.quad(ex.house, ex.contains, ex.bob),
      rdf.quad(ex.house, ex.contains, ex.alice),
      rdf.quad(ex.house, ex.contains, ex.tom),
      rdf.quad(ex.house, ns.rdf.type, ex.Container)
    ]

    const step = fromSource({
      sourceUri: ex.house.value,
      sourceClass: ex.Container.value,
      property: ex.contains.value,
      classes: [ex.Person.value, ex.Cat.value]
    })

    const result = await getStream.array(Readable.from(data).pipe(step))

    equal(
      toCanonical(result),
      toCanonical([...data, ...expectedMetadata])
    )
  })
})
