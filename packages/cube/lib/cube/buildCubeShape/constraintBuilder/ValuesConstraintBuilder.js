export class ValuesConstraintBuilder {
  constructor(rdf, threshold) {
    this.sh = rdf.ns.sh
    this.threshold = threshold
    this.values = rdf.termSet()
    this.enabled = true
  }

  add(object) {
    if (!this.enabled) return
    this.values.add(object)
    if (this.values.size > this.threshold) {
      this.enabled = false
      this.message = 'Too many values for in-list constraint.' // TODO: better message
      this.values.clear()
    }
  }

  build(ptr) {
    if (this.message) {
      ptr.addOut(this.sh.description, this.message)
      return
    }
    if (this.enabled && this.values.size > 0) {
      ptr.addList(this.sh.in, this.values)
    }
  }
}
