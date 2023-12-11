/* eslint-disable @typescript-eslint/no-explicit-any */
export class VariableMap extends Map<string, any> {
  private optionalVariables: Set<string>

  constructor(...args: ReadonlyArray<readonly [string, unknown][]>) {
    super(...args)

    this.optionalVariables = new Set()
  }

  get(key: string, { allowMissing = false } = {}) {
    if (!this.has(key) && !this.optionalVariables.has(key) && !allowMissing) {
      throw new Error(`Undefined variable '${key}'`)
    }

    return super.get(key)
  }

  set(key: string, value: unknown, { optional = false } = {}) {
    if (typeof value !== 'undefined') {
      super.set(key, value)
    }

    if (optional) {
      this.optionalVariables.add(key)
    }

    return this
  }

  static merge(left: Iterable<[string, unknown]>, right: Iterable<[string, unknown]>) {
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
