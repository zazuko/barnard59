import TermMap from '@rdfjs/term-map'
import TermSet from '@rdfjs/term-set'
import clownface from 'clownface'
import rdf from 'rdf-ext'
import * as ns from './namespaces.js'

const datatypeParsers = new TermMap([
  [ns.xsd.date, term => new Date(term.value)],
  [ns.xsd.double, term => parseFloat(term.value)],
  [ns.xsd.float, term => parseFloat(term.value)],
  [ns.xsd.gYear, term => parseInt(term.value, 10)],
  [ns.xsd.int, term => parseInt(term.value)],
  [ns.xsd.integer, term => parseInt(term.value)]
])

class Dimension {
  constructor ({ predicate, object }) {
    this.predicate = predicate
    this.termType = object.termType
    this.datatype = new TermSet()

    if (object.datatype && datatypeParsers.has(object.datatype)) {
      const datatypeParser = datatypeParsers.get(object.datatype)

      const value = datatypeParser(object)

      this.min = object
      this.minValue = value
      this.max = object
      this.maxValue = value
    } else {
      this.in = new TermSet()
    }
  }

  update ({ object }) {
    if (object.datatype) {
      this.datatype.add(object.datatype)
    }

    if (object.datatype && datatypeParsers.has(object.datatype)) {
      const datatypeParser = datatypeParsers.get(object.datatype)

      const value = datatypeParser(object)

      if (value < this.minValue) {
        this.min = object
        this.minValue = value
      }

      if (value > this.maxValue) {
        this.max = object
        this.maxValue = value
      }
    }

    if (this.in) {
      this.in.add(object)
    }
  }

  toDataset ({ shape }) {
    const dataset = rdf.dataset()

    const ptr = clownface({ dataset }).blankNode()

    ptr
      .addIn(ns.sh.property, shape)
      .addOut(ns.sh.path, this.predicate)
      .addOut(ns.sh.nodeKind, this.termType === 'NamedNode' ? ns.sh.IRI : ns.sh.Literal)
      .addOut(ns.sh.minCount, 1)
      .addOut(ns.sh.maxCount, 1)

    if (this.datatype.size === 1) {
      ptr.addOut(ns.sh.datatype, [...this.datatype][0])
    }

    if (this.datatype.size > 1) {
      ptr.addList(ns.sh.or, [...this.datatype].map(datatype => {
        return ptr
          .blankNode()
          .addOut(ns.sh.datatype, datatype)
      }))
    }

    if (this.in) {
      ptr.addList(ns.sh.in, [...this.in.values()])
    }

    if (this.min) {
      ptr.addOut(ns.sh.minInclusive, this.min)
    }

    if (this.max) {
      ptr.addOut(ns.sh.maxInclusive, this.max)
    }

    return dataset
  }
}

export default Dimension
