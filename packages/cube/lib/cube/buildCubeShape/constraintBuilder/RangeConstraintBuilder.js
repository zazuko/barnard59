export class RangeConstraintBuilder {
  // can be false in case of parsing issues
  #isInRange = value => (this.min <= value && value <= this.max)

  // consider removing the parser argument and always use fromRdf from 'rdf-literal'
  // because we rely on its behavior in case of parsing issues
  constructor(rdf, object, parser) {
    this.sh = rdf.ns.sh
    this.parser = parser
    this.minObject = object
    this.maxObject = object
    const value = parser(object)
    this.min = value
    this.max = value
    this.enabled = this.#isInRange(value)
  }

  add(object) {
    if (!this.enabled) return

    if (!object.datatype) {
      this.enabled = false
      return
    }

    const value = this.parser(object)
    if (value < this.min) {
      this.min = value
      this.minObject = object
    }
    if (value > this.max) {
      this.max = value
      this.maxObject = object
    }
    if (!this.#isInRange(value)) {
      this.enabled = false
    }
  }

  build(ptr) {
    if (!this.enabled) return

    ptr.addOut(this.sh.minInclusive, this.minObject)
    ptr.addOut(this.sh.maxInclusive, this.maxObject)
  }
}
