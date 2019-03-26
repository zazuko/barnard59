function nextLoop () {
  return new Promise(resolve => setTimeout(resolve, 0))
}

class ReadableToReadable {
  constructor (input, output) {
    this.input = input
    this.output = output

    this.destroyed = false

    this.input.once('end', () => this.destroy())
  }

  async read (size) {
    while (!this.destroyed) {
      const chunk = this.input.read(size)

      if (!chunk) {
        await nextLoop()

        continue
      }

      if (!this.output.push(chunk)) {
        return
      }
    }
  }

  destroy () {
    this.output.push(null)
    this.destroyed = true
  }
}

module.exports = ReadableToReadable
