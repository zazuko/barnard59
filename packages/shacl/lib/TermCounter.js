export default class TermCounter {
  constructor(env) {
    this.termMap = env.termMap()
  }

  add(term) {
    this.termMap.set(term, (this.termMap.get(term) ?? 0) + 1)
  }
}
