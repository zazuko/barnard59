class Queue {
  constructor () {
    this.items = []
  }

  enqueue (chunk, commit) {
    this.items.push({ chunk, commit })
  }

  dequeue () {
    const item = this.items.shift()

    if (!item) {
      return undefined
    }

    item.commit()

    return item.chunk
  }

  peek () {
    if (this.items.length === 0) {
      return undefined
    }

    return this.items[0].chunk
  }
}

module.exports = Queue
