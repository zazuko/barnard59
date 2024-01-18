export class RangeConstraintBuilder {
  // consider removing the parser argument and always use fromRdf from 'rdf-literal'
  // because we rely on its behavior in case of parsing issues
  constructor(rdf, parser) {
    this.sh = rdf.ns.sh
    this.parser = parser
    this.enabled = true
  }

  #initRange(object, value) {
    return {
      min: value,
      max: value,
      minObject: object,
      maxObject: object,
    }
  }

  #updateRange(object, value, range) {
    if (value < range.min) {
      range.min = value
      range.minObject = object
    }
    if (value > range.max) {
      range.max = value
      range.maxObject = object
    }
  }

  add(object) {
    if (!this.enabled) return

    if (!object.datatype) {
      this.enabled = false
      return
    }

    const value = this.parser(object)

    if (this.range) {
      this.#updateRange(object, value, this.range)
    } else {
      this.range = this.#initRange(object, value)
    }

    // can be false in case of parsing issues
    this.enabled = (this.range.min <= value && value <= this.range.max)
  }

  build(ptr) {
    if (this.enabled && this.range) {
      ptr.addOut(this.sh.minInclusive, this.range.minObject)
      ptr.addOut(this.sh.maxInclusive, this.range.maxObject)
    }
  }
}
