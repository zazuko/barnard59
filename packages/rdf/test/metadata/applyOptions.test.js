import { strictEqual } from 'assert'
import namespace from '@rdfjs/namespace'
import { describe, it } from 'mocha'
import rdf from 'rdf-ext'
import { Readable } from 'readable-stream'
import { applyOptions } from '../../lib/metadata/applyOptions.js'
import * as ns from '../../lib/namespaces.js'
import { xsd } from '../../lib/namespaces.js'

const ex = namespace('http://example.org/')

describe('applyOptions', () => {
  it('should be a function', () => {
    strictEqual(typeof applyOptions, 'function')
  })

  it('should return the same data if no options given', async () => {
    const data = [
      rdf.quad(ex.subject0, ns.rdf.type, ex.type0, ex.graph1)
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
      rdf.quad(ex.subject3, ns.rdf.type, ns.schema.Dataset, ex.graph0)
    ]

    const options = {
      dateCreated: rdf.literal('1999-12-31', xsd.dateTime)
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
      rdf.quad(ex.subject0, ns.rdf.type, ns.schema.Dataset, ex.graph1)
    ]

    const options = {
      dateCreated: rdf.literal('1999-12-31', xsd.dateTime).toString()
    }
    const quadStream = Readable.from(data)
    const result = [...await applyOptions(quadStream, {}, options)]

    strictEqual(result.length, 2)
    strictEqual(result[0].equals(data[0]), true)
    strictEqual(result[1].equals(rdf.quad(ex.subject0, ns.schema.dateCreated, rdf.literal('1999-12-31', xsd.dateTime))), true)
  })

  it('should update or append schema:dateModified for known classes', async () => {
    const data = [
      rdf.quad(ex.subject0, ns.rdf.type, ns.schema.Dataset, ex.graph1),
      rdf.quad(ex.subject0, ns.schema.dateModified, rdf.literal('Not me'), ex.graph0),
      rdf.quad(ex.subject1, ns.rdf.type, ex.type1, ex.graph0),
      rdf.quad(ex.subject3, ns.rdf.type, ns.schema.Dataset, ex.graph0)
    ]

    const options = {
      dateModified: rdf.literal('1999-12-31', xsd.dateTime)
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

  it('should update or append schema:dateModified for known (string)', async () => {
    const data = [
      rdf.quad(ex.subject0, ns.rdf.type, ns.schema.Dataset, ex.graph1)
    ]

    const options = {
      dateModified: rdf.literal('1999-12-31', xsd.dateTime).toString()
    }
    const quadStream = Readable.from(data)
    const result = [...await applyOptions(quadStream, {}, options)]

    strictEqual(result.length, 2)
    strictEqual(result[0].equals(data[0]), true)
    strictEqual(result[1].equals(rdf.quad(ex.subject0, ns.schema.dateModified, rdf.literal('1999-12-31', xsd.dateTime))), true)
  })

  it('should set the corresponding graph', async () => {
    const data = [
      rdf.quad(ex.subject0, ns.rdf.type, ns.schema.Dataset, ex.graph1),
      rdf.quad(ex.subject0, ns.schema.dateModified, rdf.literal('Not me'), ex.graph0),
      rdf.quad(ex.subject1, ns.rdf.type, ex.type1, ex.graph0),
      rdf.quad(ex.subject3, ns.rdf.type, ns.schema.Dataset, ex.graph0)
    ]

    const options = {
      graph: ex.graph2,
      dateModified: rdf.literal('1999-12-31', xsd.dateTime)
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
      rdf.quad(ex.subject0, ns.rdf.type, ns.schema.Dataset, ex.graph1)
    ]

    const options = {
      graph: ex.graph2.value
    }
    const quadStream = Readable.from(data)
    const result = [...await applyOptions(quadStream, {}, options)]

    strictEqual(result.length, 1)
    strictEqual(result[0].graph.equals(ex.graph2), true)
  })
})
