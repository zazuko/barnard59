export class VariableMap extends Map {
  constructor (...args) {
    super(...args)

    this.optionalVariables = new Set()
  }

  get (key) {
    if (!this.has(key) && !this.optionalVariables.has(key)) {
      throw new Error(`Undefined variable '${key}'`)
    }

    return super.get(key)
  }

  set (key, value, { optional = false } = {}) {
    if (value) {
      super.set(key, value)
    }

    if (optional) {
      this.optionalVariables.add(key)
    }
  }

  static merge (left, right) {
    const merged = new VariableMap([...left, ...right])

    if (left instanceof VariableMap) {
      left.optionalVariables.forEach(v => merged.optionalVariables.add(v))
    }
    if (right instanceof VariableMap) {
      right.optionalVariables.forEach(v => merged.optionalVariables.add(v))
    }

    return merged
  }
}
