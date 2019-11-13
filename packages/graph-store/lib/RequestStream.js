const nodeFetch = require('node-fetch')
const rdf = require('@rdfjs/data-model')
const { finished, Readable } = require('readable-stream')
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
        setTimeout(() => this._read(), 0)

        return
      }

      // end of this graph
      if (!quad.graph.equals(this.graph)) {
        this.finish()

        this.next()

        return
      }

      // just a normal quad
      this.queue.dequeue()

      const ntriple = quadToNTriples(rdf.quad(quad.subject, quad.predicate, quad.object)) + '\n'

      // high water mark reached?
      if (!this.push(ntriple)) {
        return
      }
    }
  }

  static request (queue, endpoint, options, done) {
    setTimeout(async () => {
      const graph = queue.peek().graph
      const graphParam = graph.termType === 'DefaultGraph' ? '' : `?graph=${encodeURIComponent(graph.value)}`
      const url = `${endpoint}${graphParam}`

      options.headers = options.headers || new Map()
      options.headers.set('content-type', 'application/n-triples')

      if (typeof options.user === 'string' && typeof options.password === 'string') {
        options.headers.set('authorization', 'Basic ' + Buffer.from(`${options.user}:${options.password}`).toString('base64'))
      }

      const outputStream = new RequestStream(graph, queue, () => {
        this.request(queue, endpoint, options, done)
      })

      const response = await nodeFetch(url, { body: outputStream, ...options })

      response.body.resume()

      finished(response.body, done)
    }, 0)
  }
}

module.exports = RequestStream
