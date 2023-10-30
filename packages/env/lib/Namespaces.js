export default class NamespacesFactory {
  init() {
    this.ns = {
      ...this.ns,
      p: this.namespace('https://pipeline.described.at/'),
      code: this.namespace('https://code.described.at/'),
      b59: this.namespace('https://barnard59.zazuko.com/vocab#'),
    }
  }
}
