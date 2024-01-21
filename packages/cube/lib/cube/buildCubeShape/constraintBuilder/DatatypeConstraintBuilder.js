export class DatatypeConstraintBuilder {
  constructor(rdf, datatype) {
    this.sh = rdf.ns.sh
    this.datatype = datatype
    this.enabled = true
  }

  add(object) {
    if (!this.datatype.equals(object.datatype)) {
      this.enabled = false
    }
  }

  build(ptr) {
    if (this.enabled) {
      ptr.addOut(this.sh.datatype, this.datatype)
    }
  }
}
