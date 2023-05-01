import readline from 'readline'
import { promisify } from 'util'
import padStart from 'lodash/padStart.js'
import range from 'lodash/range.js'

class Histogram {
  constructor({ max = 100, width = 40 } = {}) {
    this.max = max
    this.width = width
  }

  bar(value) {
    const pos = Math.round(value / this.max * this.width)

    return range(this.width).map(i => pos > i ? '=' : ' ').join('')
  }

  generate(data) {
    const maxTextLength = Object.keys(data).reduce((max, text) => Math.max(max, text.length), 0)

    return Object.entries(data).map(([key, value]) => {
      const text = padStart(key, maxTextLength)
      const ascii = this.bar(value)

      return `${text} | ${ascii} | ${value}`
    }).join('\n')
  }

  async draw(data) {
    if (this.height) {
      readline.moveCursor(process.stderr, 0, -this.height)
    }

    const lines = this.generate(data).split('\n')

    for (const line of lines) {
      process.stderr.write(line)

      await promisify(readline.clearLine)(process.stderr, 1)

      process.stderr.write('\n')
    }

    this.height = lines.length
  }
}

export default Histogram
