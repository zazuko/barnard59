const clownface = require('clownface')
const rdf = require('rdf-ext')
const TermMap = require('@rdfjs/term-map')
const TermSet = require('@rdfjs/term-set')
const ns = require('./namespaces')

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
    this.datatype = object.datatype

    if (this.datatype && datatypeParsers.has(this.datatype)) {
      const datatypeParser = datatypeParsers.get(this.datatype)

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
    if (this.dataset && !this.datatype.equals(object.datatype)) {
      this.datatype = null
    }

    if (this.datatype && datatypeParsers.has(this.datatype)) {
      const datatypeParser = datatypeParsers.get(this.datatype)

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

    if (this.datatype) {
      ptr.addOut(ns.sh.datatype, this.datatype)
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

module.exports = Dimension
