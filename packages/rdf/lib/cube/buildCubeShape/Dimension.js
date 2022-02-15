import TermMap from '@rdfjs/term-map'
import TermSet from '@rdfjs/term-set'
import clownface from 'clownface'
import rdf from 'rdf-ext'
import { fromRdf } from 'rdf-literal'
import * as ns from './namespaces.js'

const datatypeParsers = new TermMap([
  [ns.xsd.byte, fromRdf],
  [ns.xsd.date, fromRdf],
  [ns.xsd.dateTime, fromRdf],
  [ns.xsd.decimal, fromRdf],
  [ns.xsd.double, fromRdf],
  [ns.xsd.float, fromRdf],
  [ns.xsd.gDay, fromRdf],
  [ns.xsd.gMonthDay, fromRdf],
  [ns.xsd.gYear, fromRdf],
  [ns.xsd.gYearMonth, fromRdf],
  [ns.xsd.int, fromRdf],
  [ns.xsd.integer, fromRdf],
  [ns.xsd.long, fromRdf],
  [ns.xsd.negativeInteger, fromRdf],
  [ns.xsd.nonNegativeInteger, fromRdf],
  [ns.xsd.nonPositiveInteger, fromRdf],
  [ns.xsd.positiveInteger, fromRdf],
  [ns.xsd.short, fromRdf],
  [ns.xsd.unsignedByte, fromRdf],
  [ns.xsd.unsignedInt, fromRdf],
  [ns.xsd.unsignedLong, fromRdf],
  [ns.xsd.unsignedShort, fromRdf]
])

class Dimension {
  constructor ({ metadata, predicate, object }) {
    this.metadata = metadata
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

    if (this.metadata.term) {
      for (const quad of this.metadata.dataset.match(this.metadata.term)) {
        dataset.add(rdf.quad(ptr.term, quad.predicate, quad.object))
      }
    }

    return dataset
  }
}

export default Dimension