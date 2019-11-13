class WhenDone {
  constructor () {
    this.isDone = false
    this.error = null
    this.todo = null
  }

  done (error) {
    this.isDone = true
    this.error = error

    if (this.todo) {
      this.todo(this.error)
    }
  }

  do (todo) {
    this.todo = todo

    if (this.isDone) {
      this.todo(this.error)
    }
  }
}

module.exports = WhenDone
