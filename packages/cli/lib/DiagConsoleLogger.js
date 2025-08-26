export default class {
  constructor() {
    // eslint-disable-next-line no-console
    const log = console.error.bind(console)

    this.error = log
    this.warn = log
    this.info = log
    this.debug = log
    this.verbose = log
  }
}
