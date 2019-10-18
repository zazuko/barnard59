class WhenDone {
  constructor () {
    this.isDone = false
    this.todo = null
  }

  done () {
    this.isDone = true

    if (this.todo) {
      this.todo()
    }
  }

  do (todo) {
    this.todo = todo

    if (this.isDone) {
      this.todo()
    }
  }
}

module.exports = WhenDone
