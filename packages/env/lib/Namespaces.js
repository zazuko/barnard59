export default class NamespacesFactory {
  init() {
    this.ns = {
      ...this.ns,
      p: this.namespace('https://pipeline.described.at/'),
      code: this.namespace('https://code.described.at/'),
      cube: this.namespace('https://cube.link/'),
      meta: this.namespace('https://cube.link/meta/'),
      b59: this.namespace('https://barnard59.zazuko.com/vocab#'),
    }
  }
}
