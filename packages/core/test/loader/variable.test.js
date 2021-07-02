import { strictEqual } from 'assert'
import clownface from 'clownface'
import { describe, it } from 'mocha'
import rdf from 'rdf-ext'
import loader from '../../lib/loader/variable.js'
import ns from '../support/namespaces.js'

describe('loader/variable', () => {
  it('should load a variable from the map by name', async () => {
    const ptr = clownface({ dataset: rdf.dataset() })
      .blankNode()
      .addOut(ns.rdf.type, ns.p.Variable)
      .addOut(ns.p.name, 'foo')
    const variables = new Map([['foo', 'bar']])

    const result = await loader(ptr, { variables })

    strictEqual(result.value, 'bar')
  })

  it('should add the variable name to variable value term', async () => {
    const ptr = clownface({ dataset: rdf.dataset() })
      .blankNode()
      .addOut(ns.rdf.type, ns.p.Variable)
      .addOut(ns.p.name, 'foo')
      .addOut(ns.p.value, 'bar')

    const result = await loader(ptr)

    strictEqual(result.name, 'foo')
  })

  it('should load the variable from the dataset if it\'s not present in the variable map', async () => {
    const ptr = clownface({ dataset: rdf.dataset() })
      .blankNode()
      .addOut(ns.rdf.type, ns.p.Variable)
      .addOut(ns.p.name, 'foo')
      .addOut(ns.p.value, 'bar')

    const result = await loader(ptr)

    strictEqual(result.value, 'bar')
  })

  it('should prioritize the variable value from the variable map', async () => {
    const ptr = clownface({ dataset: rdf.dataset() })
      .blankNode()
      .addOut(ns.rdf.type, ns.p.Variable)
      .addOut(ns.p.name, 'foo')
      .addOut(ns.p.value, 'bar')
    const variables = new Map([['foo', 'barer']])

    const result = await loader(ptr, { variables })

    strictEqual(result.value, 'barer')
  })

  it('should load a variable value for a given variable name', async () => {
    const ptr = clownface({ dataset: rdf.dataset() }).literal('foo', ns.p.VariableName)
    const variables = new Map([['foo', 'bar']])

    const result = await loader(ptr, { variables })

    strictEqual(result, 'bar')
  })
})
