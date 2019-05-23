const nodeFetch = require('node-fetch')
const rdf = require('@rdfjs/data-model')
const { Readable } = require('readable-stream')
const { quadToNTriples } = require('@rdfjs/to-ntriples')

class RequestStream extends Readable {
  constructor (graph, queue, next) {
    super()

    this.graph = graph
    this.queue = queue
    this.next = next
    this.finished = false
  }

  finish () {
    this.push(null)
    this.finished = true
  }

  _read () {
    while (!this.finished) {
      const quad = this.queue.peek()

      // end of stream
      if (quad === null) {
        this.queue.dequeue()

        this.finish()

        return
      }

      // no quad in queue
      if (!quad) {
        setImmediate(() => this._read())

        return
      }

      // end of this graph
      if (!quad.graph.equals(this.graph)) {
        this.finish()

        this.next()

        return
      }

      // just a normal quad
      if (quad) {
        this.queue.dequeue()

        const ntriple = quadToNTriples(rdf.quad(quad.subject, quad.predicate, quad.object)) + '\n'

        // high water mark reached?
        if (!this.push(ntriple)) {
          return
        }
      }
    }
  }

  static request (queue, endpoint, method, options = {}) {
    setImmediate(async () => {
      const graph = queue.peek().graph
      const url = `${endpoint}?graph=${encodeURIComponent(graph.value)}`

      options.headers = options.headers || new Map()
      options.headers.set('content-type', 'application/n-triples')

      const outputStream = new RequestStream(graph, queue, () => {
        this.request(queue, endpoint, method, options)
      })

      const response = await nodeFetch(url, { method, body: outputStream, ...options })

      response.body.resume()
    })
  }
}

module.exports = RequestStream
