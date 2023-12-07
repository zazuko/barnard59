export class CompositeConstraintBuilder {
  constructor(...builders) {
    this.builders = builders
  }

  add(object) {
    this.builders.forEach(builder => builder.add(object))
  }

  build(ptr) {
    this.builders.forEach(builder => builder.build(ptr))
  }
}
