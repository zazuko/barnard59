const ns = require('./namespaces')
const Logger = require('./logger')

function nextLoop () {
  return new Promise(resolve => setTimeout(resolve, 0))
}

class Pipeline {
  constructor (node, { basePath = process.cwd(), context = {}, variables = new Map(), loaderRegistry } = {}) {
    this.node = node
    this.basePath = basePath
    this.variables = variables
    this.loaderRegistry = loaderRegistry

    this.readableObjectMode = Boolean(this.node.has(ns.rdf.type, ns.p.ReadableObjectMode).term)
    this.readable = Boolean(this.node.has(ns.rdf.type, ns.p.Readable).term) || this.readableObjectMode
    this.writableObjectMode = Boolean(this.node.has(ns.rdf.type, ns.p.WritableObjectMode).term)
    this.writable = Boolean(this.node.has(ns.rdf.type, ns.p.Writable).term) || this.writableObjectMode

    this.context = { ...context }
    this.context.basePath = this.basePath
    this.context.log = new Logger(this.node, { master: context.log })
  }

  error (err) {
    this.stream.emit('error', err)
  }

  async init (stream) {
    this.context.log.info('initializing pipeline')

    this.stream = stream
    this.context.pipeline = this.stream

    await this.initVariables()

    await this.initSteps()

    for (let index = 0; index < this.streams.length - 1; index++) {
      this.streams[index].pipe(this.streams[index + 1])
    }

    this.streams.forEach((stream, index) => {
      const step = this.steps[index]

      stream.on('error', cause => {
        const err = new Error(`error in pipeline step ${step.value}`)

        err.stack += `\nCaused by: ${cause.stack}`

        this.error(err)
      })
    })

    this.initStreamInterface()

    return this
  }

  initStreamInterface () {
    this.firstStream = this.streams[0]
    this.lastStream = this.streams[this.streams.length - 1]
    this.destroyed = false

    if (this.readable) {
      this.lastStream.on('end', () => this.stream.push(null))
    }

    if (this.writable) {
      this.stream.on('finish', () => this.firstStream.end())
    }

    this.read = async (size) => {
      for (;;) {
        if (this.destroyed) {
          return
        }

        const chunk = this.lastStream.read(size)

        if (!chunk) {
          await nextLoop()
        } else if (!this.stream.push(chunk)) {
          return
        }
      }
    }

    this.write = (chunk, encoding, callback) => {
      this.firstStream.write(chunk, encoding, callback)
    }

    this.destroy = (err, callback) => {
      this.destroyed = true

      this.context.log.end()

      callback(err)
    }
  }

  initSteps () {
    this.steps = [...this.node.out(ns.p('steps')).out(ns.p('stepList')).list()]

    return Promise.all(this.steps.map(step => this.parseStep(step))).then(streams => {
      this.streams = streams
    })
  }

  async parseArgument (arg) {
    const code = await this.loaderRegistry.load(arg, this.context, this.variables, this.basePath)

    if (code) {
      return code
    }

    if (arg.term.termType === 'Literal') {
      return arg.value
    }

    return arg
  }

  async parseOperation (operation) {
    let result = await this.loaderRegistry.load(operation, this.context, this.variables, this.basePath)

    if (!result) {
      throw new Error(`Failed to load operation ${operation.value}`)
    }

    return result
  }

  async parseStep (step) {
    const log = new Logger(step, { master: this.context.log })

    log.info('step init', { name: 'beforeStepInit' })
    const operation = await this.parseOperation(step.out(ns.code('implementedBy')))

    const args = step.out(ns.code('arguments'))

    const argsArray = (args.term ? [...args.list()] : []).map(arg => this.parseArgument(arg))

    return Promise.all(argsArray).then(resolved => {
      return operation.apply({ ...this.context, log }, resolved)
    }).then(stream => {
      stream.on('finish', () => {
        log.info('step finished', { name: 'afterStep' })
      })

      log.info('step created', { name: 'afterStepInit' })

      return stream
    }).catch(e => this.error(e))
  }

  async initVariables () {
    const parsedVariables = await this.parseVariables()

    this.variables = new Map([...parsedVariables, ...this.variables])
    this.context.variables = this.variables
  }

  parseVariables () {
    const variableNodes = this.node.out(ns.p('variables')).out(ns.p('variable'))

    return variableNodes.toArray().reduce(async (p, variableNode) => {
      const variables = await p
      const variable = await this.loaderRegistry.load(variableNode, this.context, new Map())
      if (!variable) {
        throw new Error(`Failed to load variable ${variableNode}`)
      }

      variables.push([ variable.name, variable.value ])
      return variables
    }, Promise.resolve([]))
  }
}

module.exports = Pipeline
