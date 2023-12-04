import { strictEqual } from 'assert'
import { expect } from 'chai'
import rdf from 'barnard59-env'
import { Readable } from 'readable-stream'
import { applyOptions } from '../../lib/metadata/applyOptions.js'
import * as ns from '../../lib/namespaces.js'
import { xsd } from '../../lib/namespaces.js'

const ex = rdf.namespace('http://example.org/')

describe('applyOptions', () => {
  it('should be a function', () => {
    strictEqual(typeof applyOptions, 'function')
  })

  it('should return the same data if no options given', async () => {
    const data = [
      rdf.quad(ex.subject0, ns.rdf.type, ex.type0, ex.graph1),
    ]

    const options = {}
    const quadStream = Readable.from(data, options)
    const result = [...await applyOptions(quadStream)]

    strictEqual(result.length, 1)
    strictEqual(result[0].equals(data[0]), true)
  })

  it('should update or append schema:dateCreated for known classes', async () => {
    const data = [
      rdf.quad(ex.subject0, ns.rdf.type, ns.schema.Dataset, ex.graph1),
      rdf.quad(ex.subject0, ns.schema.dateCreated, rdf.literal('Not me'), ex.graph0),
      rdf.quad(ex.subject1, ns.rdf.type, ex.type1, ex.graph0),
      rdf.quad(ex.subject3, ns.rdf.type, ns.schema.Dataset, ex.graph0),
    ]

    const options = {
      dateCreated: rdf.literal('1999-12-31', xsd.dateTime),
    }
    const quadStream = Readable.from(data)
    const result = [...await applyOptions(quadStream, {}, options)]

    strictEqual(result.length, 5)
    strictEqual(result[0].equals(data[0]), true)
    strictEqual(result[1].equals(data[2]), true)
    strictEqual(result[2].equals(data[3]), true)
    strictEqual(result[3].equals(rdf.quad(ex.subject0, ns.schema.dateCreated, rdf.literal('1999-12-31', xsd.dateTime))), true)
    strictEqual(result[4].equals(rdf.quad(ex.subject3, ns.schema.dateCreated, rdf.literal('1999-12-31', xsd.dateTime))), true)
  })

  it('should update or append schema:dateCreated for known classes (string)', async () => {
    const data = [
      rdf.quad(ex.subject0, ns.rdf.type, ns.schema.Dataset, ex.graph1),
    ]

    const options = {
      dateCreated: '1999-12-31',
    }
    const quadStream = Readable.from(data)
    const result = [...await applyOptions(quadStream, {}, options)]

    strictEqual(result.length, 2)
    strictEqual(result[0].equals(data[0]), true)
    expect(result[1]).to.deep.equal(rdf.quad(ex.subject0, ns.schema.dateCreated, rdf.literal('1999-12-31', xsd.dateTime)))
  })

  it('should update or append dcterms:created for known classes', async () => {
    const data = [
      rdf.quad(ex.subject0, ns.rdf.type, ns.dcat.Dataset, ex.graph1),
      rdf.quad(ex.subject0, ns.dcterms.created, rdf.literal('Not me'), ex.graph0),
      rdf.quad(ex.subject1, ns.rdf.type, ex.type1, ex.graph0),
      rdf.quad(ex.subject3, ns.rdf.type, ns.dcat.Dataset, ex.graph0),
    ]

    const options = {
      dateCreated: rdf.literal('1999-12-31', xsd.dateTime),
    }
    const quadStream = Readable.from(data)
    const result = [...await applyOptions(quadStream, {}, options)]

    strictEqual(result.length, 5)
    strictEqual(result[0].equals(data[0]), true)
    strictEqual(result[1].equals(data[2]), true)
    strictEqual(result[2].equals(data[3]), true)
    strictEqual(result[3].equals(rdf.quad(ex.subject0, ns.dcterms.created, rdf.literal('1999-12-31', xsd.dateTime))), true)
    strictEqual(result[4].equals(rdf.quad(ex.subject3, ns.dcterms.created, rdf.literal('1999-12-31', xsd.dateTime))), true)
  })

  it('should update or append schema:dateModified for known classes', async () => {
    const data = [
      rdf.quad(ex.subject0, ns.rdf.type, ns.schema.Dataset, ex.graph1),
      rdf.quad(ex.subject0, ns.schema.dateModified, rdf.literal('Not me'), ex.graph0),
      rdf.quad(ex.subject1, ns.rdf.type, ex.type1, ex.graph0),
      rdf.quad(ex.subject3, ns.rdf.type, ns.schema.Dataset, ex.graph0),
    ]

    const options = {
      dateModified: rdf.literal('1999-12-31', xsd.dateTime),
    }
    const quadStream = Readable.from(data)
    const result = [...await applyOptions(quadStream, {}, options)]

    strictEqual(result.length, 5)
    strictEqual(result[0].equals(data[0]), true)
    strictEqual(result[1].equals(data[2]), true)
    strictEqual(result[2].equals(data[3]), true)
    strictEqual(result[3].equals(rdf.quad(ex.subject0, ns.schema.dateModified, rdf.literal('1999-12-31', xsd.dateTime))), true)
    strictEqual(result[4].equals(rdf.quad(ex.subject3, ns.schema.dateModified, rdf.literal('1999-12-31', xsd.dateTime))), true)
  })

  it('should update or append dcterms:modified for known classes', async () => {
    const data = [
      rdf.quad(ex.subject0, ns.rdf.type, ns.dcat.Dataset, ex.graph1),
      rdf.quad(ex.subject0, ns.dcterms.modified, rdf.literal('Not me'), ex.graph0),
      rdf.quad(ex.subject1, ns.rdf.type, ex.type1, ex.graph0),
      rdf.quad(ex.subject3, ns.rdf.type, ns.dcat.Dataset, ex.graph0),
    ]

    const options = {
      dateModified: rdf.literal('1999-12-31', xsd.dateTime),
    }
    const quadStream = Readable.from(data)
    const result = [...await applyOptions(quadStream, {}, options)]

    strictEqual(result.length, 5)
    strictEqual(result[0].equals(data[0]), true)
    strictEqual(result[1].equals(data[2]), true)
    strictEqual(result[2].equals(data[3]), true)
    strictEqual(result[3].equals(rdf.quad(ex.subject0, ns.dcterms.modified, rdf.literal('1999-12-31', xsd.dateTime))), true)
    strictEqual(result[4].equals(rdf.quad(ex.subject3, ns.dcterms.modified, rdf.literal('1999-12-31', xsd.dateTime))), true)
  })

  it('should update or append both dcterms:modified and schema:modified for known classes', async () => {
    const data = [
      rdf.quad(ex.subject0, ns.rdf.type, ns.dcat.Dataset, ex.graph1),
      rdf.quad(ex.subject0, ns.rdf.type, ns.schema.Dataset, ex.graph1),
    ]

    const options = {
      dateModified: rdf.literal('1999-12-31', xsd.dateTime),
    }
    const quadStream = Readable.from(data)
    const result = [...await applyOptions(quadStream, {}, options)]

    strictEqual(result.length, 4)
    strictEqual(result[0].equals(data[0]), true)
    strictEqual(result[1].equals(data[1]), true)
    strictEqual(result[2].equals(rdf.quad(ex.subject0, ns.dcterms.modified, rdf.literal('1999-12-31', xsd.dateTime))), true)
    strictEqual(result[3].equals(rdf.quad(ex.subject0, ns.schema.dateModified, rdf.literal('1999-12-31', xsd.dateTime))), true)
  })

  it('should update or append schema:dateModified for known (string)', async () => {
    const data = [
      rdf.quad(ex.subject0, ns.rdf.type, ns.schema.Dataset, ex.graph1),
    ]

    const options = {
      dateModified: '1999-12-31',
    }
    const quadStream = Readable.from(data)
    const result = [...await applyOptions(quadStream, {}, options)]

    strictEqual(result.length, 2)
    strictEqual(result[0].equals(data[0]), true)
    expect(result[1]).to.deep.equal(rdf.quad(ex.subject0, ns.schema.dateModified, rdf.literal('1999-12-31', xsd.dateTime)))
  })

  it('should set the corresponding graph', async () => {
    const data = [
      rdf.quad(ex.subject0, ns.rdf.type, ns.schema.Dataset, ex.graph1),
      rdf.quad(ex.subject0, ns.schema.dateModified, rdf.literal('Not me'), ex.graph0),
      rdf.quad(ex.subject1, ns.rdf.type, ex.type1, ex.graph0),
      rdf.quad(ex.subject3, ns.rdf.type, ns.schema.Dataset, ex.graph0),
    ]

    const options = {
      graph: ex.graph2,
      dateModified: rdf.literal('1999-12-31', xsd.dateTime),
    }
    const quadStream = Readable.from(data)
    const result = [...await applyOptions(quadStream, {}, options)]

    strictEqual(result.length, 5)
    strictEqual(result[0].graph.equals(ex.graph2), true)
    strictEqual(result[1].graph.equals(ex.graph2), true)
    strictEqual(result[2].graph.equals(ex.graph2), true)
    strictEqual(result[3].graph.equals(ex.graph2), true)
    strictEqual(result[4].graph.equals(ex.graph2), true)
  })

  it('should set the corresponding graph (string)', async () => {
    const data = [
      rdf.quad(ex.subject0, ns.rdf.type, ns.schema.Dataset, ex.graph1),
    ]

    const options = {
      graph: ex.graph2.value,
    }
    const quadStream = Readable.from(data)
    const result = [...await applyOptions(quadStream, {}, options)]

    strictEqual(result.length, 1)
    strictEqual(result[0].graph.equals(ex.graph2), true)
  })
})
